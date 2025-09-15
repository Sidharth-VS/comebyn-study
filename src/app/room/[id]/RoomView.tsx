"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Upload,
  Download,
  Users,
  Trash,
  Pin,
  Search,
  FileText,
  ImageIcon,
  File,
  Check,
  X,
  LoaderIcon,
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { Input } from "@/src/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { uploadPdf, getPdfs, getPdfDownloadUrl, downloadPdfFromUrl } from "@/src/services/pdfServices"
import { Chat, ChatParticipants } from "@/src/components/chat"
import { useChatClient } from "@/src/hooks/use-chat-client"
import { getRoomById, deleteRoom } from "@/src/services/roomServices"

type Room = {
  id: string
  name: string
  description: string
  category: string
  subject: string
  participants: number
  maxParticipants: number
  createdAt: string
  updatedAt: string
  user_id: string
  // Add other room properties as needed
}
// Mock participants
const mockParticipants = [
  { id: "1", name: "Alice Johnson", status: "online", role: "moderator" },
  { id: "2", name: "Bob Smith", status: "online", role: "member" },
  { id: "3", name: "Carol Davis", status: "away", role: "member" },
  { id: "4", name: "David Wilson", status: "online", role: "member" },
  { id: "5", name: "Eva Brown", status: "online", role: "member" },
  { id: "6", name: "Frank Miller", status: "offline", role: "member" },
]

// File upload message type
type FileMessage = {
  id: string
  user: string
  message: string
  timestamp: string
  type: "file"
  fileName?: string
  uploadStatus?: "uploading" | "success" | "error"
}

type Pdf = {
  id: string
  name: string
  size: string
}

export const RoomView = ({ userId }: { userId: string }) => {
  const params = useParams()
  const router = useRouter()
  const roomId = params.id as string
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [files, setFiles] = useState<Pdf[]>([])
  const [fileMessages, setFileMessages] = useState<FileMessage[]>([])

  // Use the real chat hook (client-side only)
  const { participants, memberCount, isClient } = useChatClient(roomId)

  const [room, setRoom] = useState<Room | null>(null)

  useEffect(() => {
    const fetchRoom = async () => {
      const roomData = await getRoomById(roomId);

      if (roomData.success) {
        setRoom(roomData.room); 
      } else {
        console.error("❌ Failed to fetch room:", roomData.error);
      }
    };

    const fetchFiles = async () => {
      const filesData = await getPdfs(roomId);

      if (filesData.success && filesData.pdfs) {
        const obj: Pdf[] = Object.entries(filesData.pdfs).map(([key, value]: [string, any]) => ({
          id: key,
          name: value.name,
          size: value.size,
        }));
        setFiles(obj);
      } else {
        console.error("❌ Failed to fetch PDFs:", filesData.error);
        setFiles([]);
      }
    };

    if (roomId) {
      fetchRoom();
      fetchFiles();
    }
  }, [roomId]);


  if (!room || !files || userId === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Fetching room resources
        </h1>
        <p className="text-gray-600 mb-4">
          Please wait while we retrieve the study room information.
        </p>
        <LoaderIcon className="animate-spin h-6 w-6 text-gray-900" />
      </div>
    </div>
    )
  }

  // File upload handling remains the same
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file")
      return
    }

    setSelectedFile(file)
  }

  const handleFileUpload = async () => {
    if (!selectedFile) {
      fileInputRef.current?.click()
      return
    }

    setIsUploading(true)

    const fileMessage: FileMessage = {
      id: Date.now().toString(),
      user: "System",
      message: `You uploaded: ${selectedFile.name}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "file",
      fileName: selectedFile.name,
      uploadStatus: "uploading",
    }
    setFileMessages((prev) => [...prev, fileMessage])

    const formData = new FormData()
    const action = "summarize"
    formData.append("file", selectedFile)
    formData.append("action", action)

    try {
      const res = await uploadPdf(roomId, selectedFile.name, selectedFile, userId, new Date().toISOString());
     
      console.log("✅ PDF processed:", res);

      setFileMessages((prev) => prev.map((msg) => (msg.id === fileMessage.id ? { ...msg, uploadStatus: "success" } : msg)))

      const newFile = {
        id: Date.now().toString(),
        name: selectedFile.name,
        size: `${(selectedFile.size / 1024 / 1024).toFixed(2)}`,
      }
      setFiles((prev) => [newFile, ...prev])
    } 
    catch (err) {
      console.error("❌ Upload failed:", err)

      setFileMessages((prev) => prev.map((msg) => (msg.id === fileMessage.id ? { ...msg, uploadStatus: "error" } : msg)))
    } 
    finally {
      setIsUploading(false)
      setSelectedFile(null)

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDeleteRoom = () => {
    if (confirm("Are you sure you want to delete this room? This action cannot be undone.")) {
      deleteRoom(roomId);
      router.push("/");
      //make it refresh the home page
      router.refresh();
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-4 h-4 text-red-500" />
      case "image":
        return <ImageIcon className="w-4 h-4 text-blue-500" />
      default:
        return <File className="w-4 h-4 text-gray-500" />
    }
  }

  const filteredFileMessages = fileMessages.filter(
    (msg) =>
      msg.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.user.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  
  const downloadPdf = (fileId: string) => {
    const file = files.find((f) => f.id === fileId)

    if (!file) return
    console.log("Downloading file:", file);

    getPdfDownloadUrl(roomId, file.name)
      .then((res) => {
        if (res.success && res.url) {    
          downloadPdfFromUrl(res.url, file.name);
        }
      });
  }

  console.log("User ID:", userId, "Room Owner ID:", room.user_id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{room.name}</h1>
                <p className="text-sm text-gray-600">{room.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{room.category}</Badge>
              <Badge variant="outline">{room.subject}</Badge>
              <div className="flex items-center space-x-1 text-sm text-green-600">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>{memberCount} students online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[calc(110vh-200px)] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <span>Discussion</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 w-48"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Pin className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                {/* File Upload Messages */}
                {filteredFileMessages.length > 0 && (
                  <div className="border-b p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">File Uploads</h4>
                    <div className="space-y-2">
                      {filteredFileMessages.map((msg) => (
                        <div key={msg.id} className="flex items-center space-x-3 p-2 bg-blue-50 rounded border">
                          <div className="flex-shrink-0">
                            {getFileIcon("pdf")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-blue-700">{msg.fileName}</span>
                              {msg.uploadStatus === "success" && <Check className="w-4 h-4 text-green-500" />}
                              {msg.uploadStatus === "error" && <X className="w-4 h-4 text-red-500" />}
                              {msg.uploadStatus === "uploading" && (
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                              )}
                            </div>
                            <p className="text-xs text-gray-600">{msg.user} • {msg.timestamp}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Real-time Chat */}
                <div className="flex-1 overflow-hidden">
                  <Chat roomId={roomId} className="h-full" />
                </div>

                {/* File Upload Controls */}
                <div className="border-t p-4 flex-shrink-0">
                  {selectedFile && (
                    <div className="mb-2 p-2 bg-blue-50 rounded border flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-blue-700">{selectedFile.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null)
                          if (fileInputRef.current) {
                            fileInputRef.current.value = ""
                          }
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <input
                      type="file"
                      className="hidden"
                      ref={fileInputRef}
                      accept="application/pdf"
                      onChange={handleFileChange}
                    />
                    <Button variant="outline" size="sm" onClick={handleFileUpload} disabled={isUploading}>
                      <Upload className="w-4 h-4" />
                      {selectedFile ? (isUploading ? "Uploading..." : "Upload") : "Upload PDF"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Tabs defaultValue="participants" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="participants">Students</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
              </TabsList>

              <TabsContent value="participants" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>Participants ({participants.length})</span>
                      <Users className="w-4 h-4" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <ChatParticipants participants={participants} />
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="files" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>Shared Files ({files.length})</span>
                      <Button variant="outline" size="sm" onClick={handleFileUpload}>
                        <Upload className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-3">
                        {files.length > 0 && files.map((file) => (
                          <div key={file.id} className="flex items-start space-x-3 p-2 rounded border">
                            <div className="flex-shrink-0 mt-1">{getFileIcon('pdf')}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                              <p className="text-sm text-gray-600">{file.size} MB</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => downloadPdf(file.id)}>
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Room Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Room Info</span>
                  {userId === room.user_id && (
                    <Button variant="outline" size="sm" onClick={handleDeleteRoom}>
                      <Trash className="w-4 h-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Subject</p>
                  <p className="text-sm text-gray-600">{room.subject}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Category</p>
                  <Badge variant="secondary">{room.category}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Capacity</p>
                  <p className="text-sm text-gray-600">
                    {room.participants}/{room.maxParticipants} students
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
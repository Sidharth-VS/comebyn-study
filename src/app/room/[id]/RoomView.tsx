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
import type { ChatParticipant } from "@/src/hooks/use-chat-client"
import { getRoomById, deleteRoom, downloadRoomSummaryPdf } from "@/src/services/roomServices"

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
  const [isDownloadingSummary, setIsDownloadingSummary] = useState(false)
  const [files, setFiles] = useState<Pdf[]>([])
  const [fileMessages, setFileMessages] = useState<FileMessage[]>([])

  // Chat data received from Chat component
  const [participants, setParticipants] = useState<ChatParticipant[]>([])
  const [memberCount, setMemberCount] = useState(0)

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


  // Handler for receiving chat data from Chat component
  const handleChatDataUpdate = (data: { memberCount: number; participants: ChatParticipant[] }) => {
    setMemberCount(data.memberCount)
    setParticipants(data.participants)
  }

  if (!room || !files || userId === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br bg-[#efeee5] flex items-center justify-center">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-2xl font-bold text-[#1F2937] mb-2">
          Fetching room resources
        </h1>
        <p className="text-gray-600 mb-4">
          Please wait while we retrieve the study room information.
        </p>
        <LoaderIcon className="animate-spin h-6 w-6 text-[#1F2937]" />
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

  const handleDownloadSummary = async () => {
    setIsDownloadingSummary(true)
    try {
      const result = await downloadRoomSummaryPdf(roomId, room.name)
      if (!result.success) {
        alert(result.error || "Failed to download summary PDF")
      }
    } catch (error) {
      console.error("Error downloading summary:", error)
      alert("Failed to download summary PDF")
    } finally {
      setIsDownloadingSummary(false)
    }
  }

  console.log("User ID:", userId, "Room Owner ID:", room.user_id);

  return (
    <div className="min-h-screen bg-gradient-to-br bg-[#efeee5]">
      {/* Header */}
      <header className="bg-[#f9f8f0] shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="text-[#1F2937]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-[#1F2937]">{room.name}</h1>
                <p className="text-sm text-gray-600">{room.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-[#7C3AED] text-white">{room.category}</Badge>
              <Badge className="bg-[#06B6D4] text-white">{room.subject}</Badge>
              <div className="flex items-center space-x-1 text-sm text-[#06B6D4]">
                <div className="w-2 h-2 rounded-full bg-[#06B6D4]"></div>
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
            <Card className="h-[calc(110vh-200px)] flex flex-col bg-[#f9f8f0]">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2 text-[#1F2937]">
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
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                {/* File Upload Messages */}
                {filteredFileMessages.length > 0 && (
                  <div className="border-b p-4 border-gray-200">
                    <h4 className="text-sm font-medium text-[#1F2937] mb-2">File Uploads</h4>
                    <div className="space-y-2">
                      {filteredFileMessages.map((msg) => (
                        <div key={msg.id} className="flex items-center space-x-3 p-2 bg-[#E0F2FE] rounded border border-[#06B6D4]">
                          <div className="flex-shrink-0">
                            {getFileIcon("pdf")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-[#0C4A6E]">{msg.fileName}</span>
                              {msg.uploadStatus === "success" && <Check className="w-4 h-4 text-green-500" />}
                              {msg.uploadStatus === "error" && <X className="w-4 h-4 text-red-500" />}
                              {msg.uploadStatus === "uploading" && (
                                <div className="w-4 h-4 border-2 border-[#06B6D4] border-t-transparent rounded-full animate-spin" />
                              )}
                            </div>
                            <p className="text-xs text-gray-600">{msg.user} • {msg.timestamp}</p>
                          </div>
                          <Button variant="ghost" size="sm" className="text-[#06B6D4] hover:text-[#0891B2]">
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Real-time Chat */}
                <div className="flex-1 overflow-hidden">
                  <Chat
                    roomId={roomId}
                    className="h-full"
                    onDataUpdate={handleChatDataUpdate}
                    fileInputRef={fileInputRef}
                    onFileChange={handleFileChange}
                    onFileUpload={handleFileUpload}
                    isUploading={isUploading}
                    selectedFile={selectedFile}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Tabs defaultValue="participants" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[#f9f8f0]">
                <TabsTrigger value="participants" className="data-[state=active]:bg-[#7C3AED] data-[state=active]:text-white">Students</TabsTrigger>
                <TabsTrigger value="files" className="data-[state=active]:bg-[#7C3AED] data-[state=active]:text-white">Files</TabsTrigger>
              </TabsList>

              <TabsContent value="participants" className="mt-4">
                <Card className="bg-[#f9f8f0]">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between text-[#1F2937]">
                      <span>Participants ({participants.length})</span>
                      <Users className="w-4 h-4 text-[#7C3AED]" />
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
                <Card className="bg-[#f9f8f0]">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between text-[#1F2937]">
                      <span>Shared Files ({files.length})</span>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" onClick={handleDownloadSummary} disabled={isDownloadingSummary} className="bg-[#06B6D4] hover:bg-[#0891B2] text-white">
                          {isDownloadingSummary ? (
                            <LoaderIcon className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-64 w-full">
                      <div className="space-y-2 p-4">
                        {files.length > 0 && files.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-2 rounded border border-gray-200 hover:bg-gray-50">
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              <div className="flex-shrink-0">{getFileIcon('pdf')}</div>
                              <div className="min-w-0">
                                <p className="flex flex-2 max-w-45 text-sm font-medium text-[#1F2937] truncate">{file.name}</p>
                                <p className="text-xs text-gray-600">{file.size} MB</p>
                              </div>
                            </div>
                            <Button size="sm" onClick={() => downloadPdf(file.id)} className="flex-shrink-0 ml-2 bg-[#06B6D4] hover:bg-[#0891B2] text-white">
                              <Download className="w-4 h-4" />
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
            <Card className="bg-[#f9f8f0]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between text-[#1F2937]">
                  <span>Room Info</span>
                  {userId === room.user_id && (
                    <Button size="sm" onClick={handleDeleteRoom} className="bg-red-500 hover:bg-red-600 text-white">
                      <Trash className="w-4 h-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-[#1F2937]">Subject</p>
                  <p className="text-sm text-gray-600">{room.subject}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1F2937]">Category</p>
                  <Badge className="bg-[#7C3AED] text-white">{room.category}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
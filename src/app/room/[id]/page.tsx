"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Send,
  Upload,
  Download,
  Users,
  Settings,
  Pin,
  Search,
  FileText,
  ImageIcon,
  File,
  Check,
  X,
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar"
import { Textarea } from "@/src/components/ui/textarea"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { Input } from "@/src/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { uploadPdf } from "@/src/services/pdfServices"
import { Chat, ChatParticipants } from "@/src/components/chat"
import { useChatClient } from "@/src/hooks/use-chat-client"

// Mock room data
const mockRoomData = {
  "1": {
    id: "1",
    name: "Calculus Study Group",
    description: "Working through calculus problems and sharing study materials",
    participants: 12,
    maxParticipants: 50,
    category: "Mathematics",
    subject: "Calculus",
  },
  "2": {
    id: "2",
    name: "Computer Science Fundamentals",
    description: "Discussing algorithms, data structures, and programming concepts",
    participants: 18,
    maxParticipants: 30,
    category: "Computer Science",
    subject: "CS Fundamentals",
  },
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

// Mock files
const mockFiles = [
  {
    id: "1",
    name: "Calculus_Notes_Chapter_3.pdf",
    type: "pdf",
    size: "2.4 MB",
    uploadedBy: "Alice Johnson",
    uploadedAt: "2 hours ago",
  },
  {
    id: "2",
    name: "Practice_Problems.pdf",
    type: "pdf",
    size: "1.8 MB",
    uploadedBy: "Carol Davis",
    uploadedAt: "1 hour ago",
  },
  {
    id: "3",
    name: "Integration_Techniques.pdf",
    type: "pdf",
    size: "3.2 MB",
    uploadedBy: "David Wilson",
    uploadedAt: "30 minutes ago",
  },
  {
    id: "4",
    name: "Derivative_Examples.jpg",
    type: "image",
    size: "856 KB",
    uploadedBy: "Bob Smith",
    uploadedAt: "45 minutes ago",
  },
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

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.id as string
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [files, setFiles] = useState(mockFiles)
  const [fileMessages, setFileMessages] = useState<FileMessage[]>([])

  // Use the real chat hook (client-side only)
  const { participants, memberCount, isClient } = useChatClient(roomId)

  const room = mockRoomData[roomId as keyof typeof mockRoomData]

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Study room not found</h1>
          <p className="text-gray-600 mb-4">The study room you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Rooms
          </Button>
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
      const res = await uploadPdf(roomId, selectedFile.name, selectedFile);

      /*const res = await fetch("/api/pdf", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Server ${res.status}: ${errorText}`)
      }*/
     
      console.log("✅ PDF processed:", res);

      setFileMessages((prev) => prev.map((msg) => (msg.id === fileMessage.id ? { ...msg, uploadStatus: "success" } : msg)))

      const newFile = {
        id: Date.now().toString(),
        name: selectedFile.name,
        type: "pdf",
        size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
        uploadedBy: "You",
        uploadedAt: "Just now",
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
                        {files.map((file) => (
                          <div key={file.id} className="flex items-start space-x-3 p-2 rounded border">
                            <div className="flex-shrink-0 mt-1">{getFileIcon(file.type)}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                              <p className="text-xs text-gray-600">
                                {file.size} • by {file.uploadedBy}
                              </p>
                              <p className="text-xs text-gray-400">{file.uploadedAt}</p>
                            </div>
                            <Button variant="ghost" size="sm">
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
                  <Settings className="w-4 h-4" />
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
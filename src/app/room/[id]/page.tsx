"use client"

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
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar"
import { Textarea } from "@/src/components/ui/textarea"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { Input } from "@/src/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"

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

// Mock chat messages
const mockMessages = [
  {
    id: "1",
    user: "Alice Johnson",
    message: "Hey everyone! I've uploaded the calculus notes from today's lecture.",
    timestamp: "2:30 PM",
    type: "message",
  },
  {
    id: "2",
    user: "Bob Smith",
    message: "Thanks Alice! I was struggling with the derivative problems.",
    timestamp: "2:32 PM",
    type: "message",
  },
  {
    id: "3",
    user: "Carol Davis",
    message: "I've shared a PDF with practice problems. Check the files section!",
    timestamp: "2:35 PM",
    type: "message",
  },
  {
    id: "4",
    user: "System",
    message: "David Wilson uploaded: Integration_Techniques.pdf",
    timestamp: "2:40 PM",
    type: "file",
    fileName: "Integration_Techniques.pdf",
  },
  {
    id: "5",
    user: "Eva Brown",
    message: "Can someone help me with problem 15 from the homework?",
    timestamp: "2:45 PM",
    type: "message",
  },
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

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.id as string
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [newMessage, setNewMessage] = useState("")
  const [messages, setMessages] = useState(mockMessages)
  const [searchQuery, setSearchQuery] = useState("")

  const room = mockRoomData[roomId as keyof typeof mockRoomData]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        user: "You",
        message: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: "message" as const,
      }
      setMessages([...messages, message])
      setNewMessage("")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Please upload a PDF file");
        return;
      }
      console.log("Selected PDF:", file);
      // TODO: send file to backend (API route / storage service)
    }
  }

  const handleFileUpload = () => {
    // Simulate file upload
    fileInputRef.current?.click();
    const fileMessage = {
      id: Date.now().toString(),
      user: "System",
      message: "You uploaded: Sample_Document.pdf",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "file" as const,
      fileName: "Sample_Document.pdf",
    }
    setMessages([...messages, fileMessage])
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

  const filteredMessages = messages.filter(
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
                <span>{room.participants} students online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[700px] flex flex-col">
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

              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {filteredMessages.map((msg) => (
                      <div key={msg.id} className="flex space-x-3">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className="text-xs">
                            {msg.user === "System"
                              ? "S"
                              : msg.user
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">{msg.user}</span>
                            <span className="text-xs text-gray-500">{msg.timestamp}</span>
                          </div>
                          <div className={`text-sm ${msg.type === "file" ? "bg-blue-50 p-2 rounded border" : ""}`}>
                            {msg.type === "file" ? (
                              <div className="flex items-center space-x-2">
                                {getFileIcon("pdf")}
                                <span className="text-blue-600">{msg.fileName}</span>
                                <Button variant="ghost" size="sm">
                                  <Download className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <p className="text-gray-700">{msg.message}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t p-4 flex-shrink-0">
                  <div className="flex space-x-2">
                    <input 
                      type="file" 
                      className="hidden"
                      ref={fileInputRef}
                      accept="application/pdf"
                      onChange={handleFileChange}
                    />
                    <Button variant="outline" size="sm" onClick={handleFileUpload}>
                      <Upload className="w-4 h-4" />
                    </Button>
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
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
                      <span>Participants ({mockParticipants.length})</span>
                      <Users className="w-4 h-4" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-3">
                        {mockParticipants.map((participant) => (
                          <div key={participant.id} className="flex items-center space-x-3">
                            <div className="relative">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="text-xs">
                                  {participant.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div
                                className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                                  participant.status === "online"
                                    ? "bg-green-500"
                                    : participant.status === "away"
                                      ? "bg-yellow-500"
                                      : "bg-gray-400"
                                }`}
                              ></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{participant.name}</p>
                              <div className="flex items-center space-x-2">
                                <p className="text-xs text-gray-500 capitalize">{participant.status}</p>
                                {participant.role === "moderator" && (
                                  <Badge variant="secondary" className="text-xs">
                                    Mod
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="files" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>Shared Files ({mockFiles.length})</span>
                      <Button variant="outline" size="sm" onClick={handleFileUpload}>
                        <Upload className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-3">
                        {mockFiles.map((file) => (
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
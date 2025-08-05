"use client"

import { useState, useMemo } from "react"
import { Search, Users, BookOpen, Upload, MessageSquare } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Mock data for study rooms
const mockRooms = [
  {
    id: "1",
    name: "Calculus Study Group",
    description: "Working through calculus problems and sharing study materials",
    participants: 12,
    maxParticipants: 50,
    isActive: true,
    category: "Mathematics",
    subject: "Calculus",
    tags: ["calculus", "derivatives", "integrals", "math"],
    recentActivity: "2 minutes ago",
    filesCount: 8,
    messagesCount: 156,
  },
  {
    id: "2",
    name: "Computer Science Fundamentals",
    description: "Discussing algorithms, data structures, and programming concepts",
    participants: 18,
    maxParticipants: 30,
    isActive: true,
    category: "Computer Science",
    subject: "CS Fundamentals",
    tags: ["algorithms", "data-structures", "programming", "cs"],
    recentActivity: "5 minutes ago",
    filesCount: 15,
    messagesCount: 243,
  },
  {
    id: "3",
    name: "Biology Lab Discussion",
    description: "Share lab reports, discuss experiments, and study for exams",
    participants: 9,
    maxParticipants: 25,
    isActive: true,
    category: "Biology",
    subject: "Lab Work",
    tags: ["biology", "lab", "experiments", "reports"],
    recentActivity: "1 hour ago",
    filesCount: 12,
    messagesCount: 89,
  },
  {
    id: "4",
    name: "History Essay Workshop",
    description: "Peer review essays, share research sources, and discuss historical topics",
    participants: 7,
    maxParticipants: 20,
    isActive: true,
    category: "History",
    subject: "Essay Writing",
    tags: ["history", "essays", "research", "writing"],
    recentActivity: "30 minutes ago",
    filesCount: 6,
    messagesCount: 67,
  },
  {
    id: "5",
    name: "Physics Problem Solving",
    description: "Collaborative problem solving and concept clarification",
    participants: 14,
    maxParticipants: 35,
    isActive: true,
    category: "Physics",
    subject: "Problem Solving",
    tags: ["physics", "problems", "mechanics", "thermodynamics"],
    recentActivity: "15 minutes ago",
    filesCount: 10,
    messagesCount: 198,
  },
  {
    id: "6",
    name: "Literature Analysis",
    description: "Analyze texts, share interpretations, and discuss themes",
    participants: 3,
    maxParticipants: 15,
    isActive: false,
    category: "Literature",
    subject: "Text Analysis",
    tags: ["literature", "analysis", "themes", "interpretation"],
    recentActivity: "2 days ago",
    filesCount: 4,
    messagesCount: 23,
  },
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return mockRooms

    const query = searchQuery.toLowerCase()
    return mockRooms.filter(
      (room) =>
        room.name.toLowerCase().includes(query) ||
        room.description.toLowerCase().includes(query) ||
        room.category.toLowerCase().includes(query) ||
        room.subject.toLowerCase().includes(query) ||
        room.tags.some((tag) => tag.toLowerCase().includes(query)),
    )
  }, [searchQuery])

  const activeRooms = filteredRooms.filter((room) => room.isActive)
  const inactiveRooms = filteredRooms.filter((room) => !room.isActive)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">StudyRooms</h1>
            </div>
            <Button>Create Study Room</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search study rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Rooms</p>
                  <p className="text-2xl font-bold text-gray-900">{activeRooms.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Students Online</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockRooms.reduce((sum, room) => sum + room.participants, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Upload className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Files Shared</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockRooms.reduce((sum, room) => sum + room.filesCount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Messages Today</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockRooms.reduce((sum, room) => sum + room.messagesCount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Rooms */}
        {activeRooms.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              Active Study Rooms ({activeRooms.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          </section>
        )}

        {/* Inactive Rooms */}
        {inactiveRooms.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
              Inactive Rooms ({inactiveRooms.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inactiveRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          </section>
        )}

        {/* No Results */}
        {filteredRooms.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No study rooms found</h3>
            <p className="text-gray-600">Try adjusting your search terms or create a new study room.</p>
          </div>
        )}
      </main>
    </div>
  )
}

function RoomCard({ room }: { room: (typeof mockRooms)[0] }) {
  const occupancyPercentage = (room.participants / room.maxParticipants) * 100
  const isNearFull = occupancyPercentage > 80

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg ${room.isActive ? "hover:scale-105" : "opacity-75"}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-1">{room.name}</CardTitle>
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {room.category}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {room.subject}
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {room.isActive ? (
              <MessageSquare className="w-4 h-4 text-green-500" />
            ) : (
              <MessageSquare className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-sm text-gray-600 mb-4 line-clamp-2">{room.description}</CardDescription>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center space-x-1 text-gray-600">
            <Users className="w-4 h-4" />
            <span>{room.participants} students</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600">
            <Upload className="w-4 h-4" />
            <span>{room.filesCount} files</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600">
            <MessageSquare className="w-4 h-4" />
            <span>{room.messagesCount} messages</span>
          </div>
          <div className="text-xs text-gray-500">Active {room.recentActivity}</div>
        </div>

        {/* Occupancy Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${isNearFull ? "bg-red-500" : "bg-blue-500"}`}
            style={{ width: `${occupancyPercentage}%` }}
          ></div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {room.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>

        <Link href={`/room/${room.id}`}>
          <Button
            className="w-full"
            disabled={!room.isActive || room.participants >= room.maxParticipants}
            variant={room.isActive ? "default" : "secondary"}
          >
            {!room.isActive
              ? "Room Inactive"
              : room.participants >= room.maxParticipants
                ? "Room Full"
                : "Join Study Room"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

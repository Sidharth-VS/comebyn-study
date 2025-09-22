"use client"

import { motion } from "framer-motion"
import { useState, useMemo, useEffect } from "react"
import { Search, Users, BookOpen, Upload, MessageSquare, Plus } from "lucide-react"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getAllRooms } from "@/src/services/roomServices"
import { NewRoomDialog } from "@/src/modules/room/components/new-room-dialog"
import { authClient } from "../lib/auth-client"
import StaggeredDropDown from "../components/navdropdown"

type Room = {
  id: string
  name: string
  userid: string
  description: string
  participants: number
  maxParticipants: number
  isActive: boolean
  category: string
  subject: string
  tags: string[]
  recentActivity: string
  filesCount: number
  messagesCount: number
}

const normalizeRoom = (room: any): Room => ({
  id: room.id?.toString() ?? "",
  name: room.name ?? "Untitled Room",
  description: room.description ?? "No description provided",
  participants: room.participants ?? 0,
  maxParticipants: room.maxParticipants ?? 10,
  isActive: room.isActive ?? true,
  category: room.category ?? "General",
  subject: room.subject ?? "",
  tags: Array.isArray(room.tags) ? room.tags : [],
  recentActivity: room.recentActivity ?? "N/A",
  filesCount: room.filesCount ?? 0,
  messagesCount: room.messagesCount ?? 0,
  userid: room.userid ?? "",
})

const HomeView = ( { userId }: { userId: string } ) => {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const [rooms, setRooms] = useState<Room[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await getAllRooms()

        if (res.success === false) {
          setError(res.error || "Failed to fetch rooms")
          setRooms([])
        } else {
          // Assume the API returns an array of rooms or an object with rooms array
          const roomsData = Array.isArray(res) ? res : res.rooms || []
          setRooms(roomsData.map(normalizeRoom))
        }
      } catch (err) {
        setError("Failed to fetch rooms")
        setRooms([])
      } finally {
        setLoading(false)
      }
    }
    fetchRooms()
  }, [])

  const sourceRooms = useMemo(() => rooms, [rooms])

  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return sourceRooms

    const query = searchQuery.toLowerCase()
    return sourceRooms.filter(
      (room) =>
        room.name.toLowerCase().includes(query) ||
        room.description.toLowerCase().includes(query) ||
        room.category.toLowerCase().includes(query) ||
        room.subject.toLowerCase().includes(query) ||
        room.tags.some((tag: string) => tag.toLowerCase().includes(query)),
    )
  }, [searchQuery, sourceRooms])

  const activeRooms = filteredRooms.filter((room) => room.isActive)
  const inactiveRooms = filteredRooms.filter((room) => !room.isActive)

  const totalParticipants = sourceRooms.reduce((sum, room) => sum + room.participants, 0)
  const totalFiles = sourceRooms.reduce((sum, room) => sum + room.filesCount, 0)
  const totalMessages = sourceRooms.reduce((sum, room) => sum + room.messagesCount, 0)

  const handleRoomCreated = (newRoom: any) => {
    const normalizedRoom = normalizeRoom(newRoom)
    setRooms((prevRooms) => [normalizedRoom, ...prevRooms])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <StaggeredDropDown />
              <h1 className="text-2xl font-bold text-gray-900">ComeByN Study</h1>
            </div>
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.99 }}>
                <Button onClick={() => setShowForm(true)} className=" bg-blue-600 hover:bg-blue-700">Create Study Room</Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  className=" bg-blue-600 hover:bg-blue-70"
                  onClick={() =>
                    authClient.signOut({
                      fetchOptions: {
                        onSuccess: () => router.push("/sign-in"),
                      },
                    })
                  }
                >
                  Sign out
                </Button>
              </motion.div>
            </div>
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
                  <p className="text-2xl font-bold text-gray-900">{totalParticipants}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{totalFiles}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{totalMessages}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading study rooms...</h3>
            <p className="text-gray-600">Please wait while we fetch the latest rooms.</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load rooms</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {!loading && !error && sourceRooms.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No study rooms yet</h3>
            <p className="text-gray-600 mb-4">Be the first to create a study room and start collaborating!</p>
            <Button onClick={() => setShowForm(true)}>Create Your First Room</Button>
          </div>
        )}

        {/* Active Rooms */}
        {!loading && !error && activeRooms.length > 0 && (
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
        {!loading && !error && inactiveRooms.length > 0 && (
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

        {/* No Search Results */}
        {!loading && !error && sourceRooms.length > 0 && filteredRooms.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No matching rooms found</h3>
            <p className="text-gray-600">Try adjusting your search terms or create a new study room.</p>
          </div>
        )}
      </main>

      <NewRoomDialog open={showForm} onOpenChange={setShowForm} onRoomCreated={handleRoomCreated} userId={userId} />
    </div>
  )
}

function RoomCard({ room }: { room: Room }) {
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

export default HomeView

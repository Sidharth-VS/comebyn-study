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
    <div className="min-h-screen bg-gradient-to-br bg-[#efeee5]">
      {/* Header */}
      <header className="shadow-sm border-b bg-[#f9f8f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <StaggeredDropDown />
              <h1 className="text-2xl font-bold text-[#1F2937]">ComeByN Study</h1>
            </div>
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
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

        {loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-[#1F2937] mb-2">Loading study rooms...</h3>
            <p className="text-gray-600">Please wait while we fetch the latest rooms.</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-[#1F2937] mb-2">Failed to load rooms</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white">
              Try Again
            </Button>
          </div>
        )}

        {!loading && !error && sourceRooms.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-[#1F2937] mb-2">No study rooms yet</h3>
            <p className="text-gray-600 mb-4">Be the first to create a study room and start collaborating!</p>
            <Button onClick={() => setShowForm(true)} className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white">Create Your First Room</Button>
          </div>
        )}

        {/* Active Rooms */}
        {!loading && !error && activeRooms.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#1F2937] flex items-center">
                <div className="w-3 h-3 bg-[#06B6D4] rounded-full mr-2"></div>
                Study Rooms ({activeRooms.length})
              </h2>
              <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.99 }}>
                <Button onClick={() => setShowForm(true)} className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white">
                  Create Study Room
                </Button>
              </motion.div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeRooms.map((room) => (
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
            <h3 className="text-lg font-medium text-[#1F2937] mb-2">No matching rooms found</h3>
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
    <Card className={`transition-all duration-200 hover:shadow-lg ${room.isActive ? "hover:scale-105" : "opacity-75"} overflow-hidden bg-[#f9f8f0]`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-[#1F2937] mb-1 truncate">{room.name}</CardTitle>
            <div className="flex items-center space-x-2 mb-2 flex-wrap gap-2">
              <Badge className="text-xs truncate bg-[#efeee5] text-[#1F2937]">
                {room.category}
              </Badge>
              <Badge className="text-xs truncate bg-[#efeee5] text-[#1F2937]">
                {room.subject}
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-1 flex-shrink-0">
            {room.isActive ? (
              <MessageSquare className="w-4 h-4 text-[#06B6D4]" />
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
        </div>

        {/* Occupancy Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${isNearFull ? "bg-red-500" : "bg-[#7C3AED]"}`}
            style={{ width: `${occupancyPercentage}%` }}
          ></div>
        </div>

        {/* Tags */}
        <div className="flex flex-2 gap-1 mb-4">
          {room.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} className="text-xs bg-[#E0F2FE] text-[#0C4A6E] border-[#06B6D4]">
              #{tag}
            </Badge>
          ))}
        </div>

        <Link href={`/room/${room.id}`}>
          <Button
            className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
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

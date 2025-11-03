"use client"

import React, { useState, useRef, useEffect } from "react"
import { Send, AlertCircle, Wifi, WifiOff, Users } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Textarea } from "@/src/components/ui/textarea"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { Alert, AlertDescription } from "@/src/components/ui/alert"
import { useChatClient, type ChatMessage, type ChatParticipant } from "@/src/hooks/use-chat-client"

interface ChatProps {
  roomId: string
  className?: string
  onDataUpdate?: (data: { memberCount: number; participants: ChatParticipant[] }) => void
}

/**
 * Real-time chat component with WebSocket integration
 */
export function Chat({ roomId, className = "", onDataUpdate }: ChatProps) {
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const {
    connectionState,
    messages,
    participants,
    memberCount,
    error,
    sendMessage,
    sendTyping,
    clearError,
    isClient
  } = useChatClient(roomId)

  /**
   * Scroll to bottom of messages
   */
  const scrollToBottom = () => {
    const scrollArea = scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight
    }
  }

  /**
   * Auto-scroll when new messages arrive
   */
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  /**
   * Notify parent component when memberCount or participants change
   */
  useEffect(() => {
    if (onDataUpdate) {
      onDataUpdate({ memberCount, participants })
    }
  }, [memberCount, participants, onDataUpdate])

  /**
   * Handle sending a message
   */
  const handleSendMessage = () => {
    if (newMessage.trim() && sendMessage(newMessage)) {
      setNewMessage("")
      // Stop typing indicator
      if (isTyping) {
        sendTyping(false)
        setIsTyping(false)
      }
    }
  }

  /**
   * Handle typing indicator
   */
  const handleTyping = (text: string) => {
    setNewMessage(text)
    
    const wasTyping = isTyping
    const currentlyTyping = text.trim().length > 0

    if (currentlyTyping && !wasTyping) {
      sendTyping(true)
      setIsTyping(true)
    } else if (!currentlyTyping && wasTyping) {
      sendTyping(false)
      setIsTyping(false)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set timeout to stop typing indicator after 2 seconds of inactivity
    if (currentlyTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(false)
        setIsTyping(false)
      }, 2000)
    }
  }

  /**
   * Handle Enter key press
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { 
      hour: "2-digit", 
      minute: "2-digit" 
    })
  }

  /**
   * Get connection status icon and text
   */
  const getConnectionStatus = () => {
    switch (connectionState) {
      case "connected":
        return { icon: <Wifi className="w-4 h-4 text-green-500" />, text: "Connected" }
      case "connecting":
        return { icon: <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />, text: "Connecting..." }
      case "disconnected":
        return { icon: <WifiOff className="w-4 h-4 text-gray-500" />, text: "Disconnected" }
      case "error":
        return { icon: <AlertCircle className="w-4 h-4 text-red-500" />, text: "Connection Error" }
      default:
        return { icon: <WifiOff className="w-4 h-4 text-gray-500" />, text: "Unknown" }
    }
  }

  const connectionStatus = getConnectionStatus()

  // Show loading state until client-side hydration
  if (!isClient) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading chat...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-gray-900">Chat</h3>
          <div className="flex items-center space-x-1">
            {connectionStatus.icon}
            <span className="text-sm text-gray-600">{connectionStatus.text}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{memberCount} online</span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="m-4" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearError}
              className="h-auto p-1"
            >
              ×
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="flex space-x-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="text-xs">
                      {message.senderName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {message.senderName}
                      </span>
                      {message.isOwn && (
                        <Badge variant="secondary" className="text-xs">
                          You
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700">
                      <p className="whitespace-pre-wrap break-words">{message.text}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Message Input */}
      <div className="border-t p-4 bg-white">
        <div className="flex space-x-2">
          <Textarea
            placeholder={
              connectionState === "connected" 
                ? "Type your message..." 
                : "Connecting to chat..."
            }
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 min-h-[40px] max-h-[120px] resize-none"
            disabled={connectionState !== "connected"}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!newMessage.trim() || connectionState !== "connected"}
            className="px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Participants list component
 */
export function ChatParticipants({ participants }: { participants: ChatParticipant[] }) {
  return (
    <div className="space-y-3">
      {participants.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No participants</p>
      ) : (
        participants.map((participant) => (
          <div key={participant.userId} className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">
                  {participant.username
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div
                className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                  participant.isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {participant.username}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {participant.isOnline ? "online" : "offline"}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

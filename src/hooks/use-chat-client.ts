"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { authClient } from "@/src/lib/auth-client"

/**
 * WebSocket message types from backend
 */
interface ServerMessageEvent {
  type: "message"
  roomId: string
  messageId: string
  senderId: string
  senderName?: string
  text: string
  sentAt: string
}

interface ServerPresenceEvent {
  type: "presence"
  action: "join" | "leave"
  roomId: string
  userId: string
  username?: string
  members: number
}

interface ServerErrorEvent {
  type: "error"
  code: string
  message: string
}

interface JoinAckEvent {
  type: "join-ack"
  roomId: string
  userId: string
  username?: string
  members: number
}

type ServerEvent = ServerMessageEvent | ServerPresenceEvent | ServerErrorEvent | JoinAckEvent

interface ClientMessageEvent {
  type: "message"
  messageId: string
  text: string
}

interface ClientTypingEvent {
  type: "typing"
  isTyping: boolean
}

type ClientEvent = ClientMessageEvent | ClientTypingEvent

/**
 * Chat message interface for UI
 */
export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  text: string
  timestamp: Date
  isOwn: boolean
}

/**
 * Chat participant interface
 */
export interface ChatParticipant {
  userId: string
  username: string
  isOnline: boolean
}

/**
 * Chat connection state
 */
export type ChatConnectionState = "connecting" | "connected" | "disconnected" | "error"

/**
 * Custom hook for real-time chat functionality (client-side only)
 */
export function useChatClient(roomId: string) {
  const [connectionState, setConnectionState] = useState<ChatConnectionState>("disconnected")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [participants, setParticipants] = useState<ChatParticipant[]>([])
  const [memberCount, setMemberCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  /**
   * Generate a JWT token for development/testing
   */
  const generateDevToken = useCallback((userId: string, username: string): string => {
    // Simple JWT-like token for development
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
    const payload = btoa(JSON.stringify({
      sub: userId,
      name: username,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    }))
    const signature = btoa("dev-signature")
    return `${header}.${payload}.${signature}`
  }, [])

  /**
   * Get authentication token from auth client
   */
  const getAuthToken = useCallback(async (): Promise<string | null> => {
    if (!isClient) {
      return generateDevToken("dev-user-123", "Development User")
    }

    try {
      const session = await authClient.getSession()
      console.log("Better Auth session:", session)
      
      if (session?.data?.user) {
        // Try multiple token storage locations
        const token = 
          localStorage.getItem("bearer_token") ||
          localStorage.getItem("auth-token") ||
          session.data.token ||
          session.data.accessToken
        
        if (token) {
          console.log("Found auth token:", token.substring(0, 20) + "...")
          return token
        }
        
        // Generate a token based on the user session
        const userId = session.data.user.id || "user-" + Date.now()
        const username = session.data.user.name || session.data.user.email || "User"
        const devToken = generateDevToken(userId, username)
        console.log("Generated dev token for user:", username)
        return devToken
      }
      
      // No session, create a guest token
      const guestToken = generateDevToken("guest-" + Date.now(), "Guest User")
      console.log("No session found, using guest token")
      return guestToken
    } catch (error) {
      console.error("Failed to get auth token:", error)
      // For development, return a mock token
      return generateDevToken("error-user-123", "Error User")
    }
  }, [isClient, generateDevToken])

  /**
   * Connect to WebSocket chat
   */
  const connect = useCallback(async () => {
    if (!isClient) {
      return
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    setConnectionState("connecting")
    setError(null)

    try {
      const token = await getAuthToken()
      if (!token) {
        setError("Authentication required")
        setConnectionState("error")
        return
      }

      // Build WebSocket URL with query parameters
      const wsUrl = new URL("ws://localhost:8000/ws/chat")
      wsUrl.searchParams.set("room", roomId)
      wsUrl.searchParams.set("token", token)

      const ws = new WebSocket(wsUrl.toString())
      wsRef.current = ws

      ws.onopen = () => {
        console.log("Chat WebSocket connected")
        setConnectionState("connected")
        reconnectAttempts.current = 0
      }

      ws.onmessage = (event) => {
        try {
          const data: ServerEvent = JSON.parse(event.data)
          handleServerMessage(data)
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error)
        }
      }

      ws.onclose = (event) => {
        console.log("Chat WebSocket disconnected:", event.code, event.reason)
        setConnectionState("disconnected")
        
        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000)
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++
            connect()
          }, delay)
        }
      }

      ws.onerror = (error) => {
        console.error("Chat WebSocket error:", error)
        setError("Connection error")
        setConnectionState("error")
      }

    } catch (error) {
      console.error("Failed to connect to chat:", error)
      setError("Failed to connect")
      setConnectionState("error")
    }
  }, [roomId, getAuthToken, isClient])

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, "User disconnected")
      wsRef.current = null
    }
    
    setConnectionState("disconnected")
    reconnectAttempts.current = 0
  }, [])

  /**
   * Handle incoming server messages
   */
  const handleServerMessage = useCallback((data: ServerEvent) => {
    switch (data.type) {
      case "message":
        const message: ChatMessage = {
          id: data.messageId,
          senderId: data.senderId,
          senderName: data.senderName || "Unknown",
          text: data.text,
          timestamp: new Date(data.sentAt),
          isOwn: false // Will be updated based on current user
        }
        setMessages(prev => [...prev, message])
        break

      case "presence":
        setMemberCount(data.members)
        
        if (data.action === "join") {
          setParticipants(prev => {
            const existing = prev.find(p => p.userId === data.userId)
            if (existing) {
              return prev.map(p => 
                p.userId === data.userId 
                  ? { ...p, isOnline: true, username: data.username || p.username }
                  : p
              )
            } else {
              return [...prev, {
                userId: data.userId,
                username: data.username || "Unknown",
                isOnline: true
              }]
            }
          })
        } else if (data.action === "leave") {
          setParticipants(prev => 
            prev.map(p => 
              p.userId === data.userId 
                ? { ...p, isOnline: false }
                : p
            )
          )
        }
        break

      case "join-ack":
        setMemberCount(data.members)
        // Update current user info in messages
        setMessages(prev => 
          prev.map(msg => ({
            ...msg,
            isOwn: msg.senderId === data.userId
          }))
        )
        break

      case "error":
        setError(data.message)
        console.error("Chat server error:", data.code, data.message)
        break
    }
  }, [])

  /**
   * Send a chat message
   */
  const sendMessage = useCallback((text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError("Not connected to chat")
      return false
    }

    if (!text.trim()) {
      return false
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const message: ClientMessageEvent = {
      type: "message",
      messageId,
      text: text.trim()
    }

    try {
      wsRef.current.send(JSON.stringify(message))
      return true
    } catch (error) {
      console.error("Failed to send message:", error)
      setError("Failed to send message")
      return false
    }
  }, [])

  /**
   * Send typing indicator
   */
  const sendTyping = useCallback((isTyping: boolean) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return
    }

    const typingEvent: ClientTypingEvent = {
      type: "typing",
      isTyping
    }

    try {
      wsRef.current.send(JSON.stringify(typingEvent))
    } catch (error) {
      console.error("Failed to send typing indicator:", error)
    }
  }, [])

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Connect on mount and when roomId changes (client-side only)
  useEffect(() => {
    if (isClient && roomId) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [roomId, connect, disconnect, isClient])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    connectionState,
    messages,
    participants,
    memberCount,
    error,
    sendMessage,
    sendTyping,
    connect,
    disconnect,
    clearError,
    isClient
  }
}

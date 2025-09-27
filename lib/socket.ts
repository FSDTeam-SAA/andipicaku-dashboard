import { io, type Socket } from "socket.io-client"

class SocketManager {
  private socket: Socket | null = null
  private userId: string | null = null

  connect(userId: string) {
    if (this.socket?.connected && this.userId === userId) {
      return this.socket
    }

    this.disconnect()

    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_BASE_URL || "http://localhost:5000", {
      transports: ["websocket"],
      autoConnect: true,
    })

    this.userId = userId

    this.socket.on("connect", () => {
      console.log("[v0] Socket connected:", this.socket?.id)
      this.socket?.emit("joinChatRoom", userId)
    })

    this.socket.on("disconnect", () => {
      console.log("[v0] Socket disconnected")
    })

    this.socket.on("connect_error", (error) => {
      console.error("[v0] Socket connection error:", error)
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.userId = null
    }
  }

  getSocket() {
    return this.socket
  }

  isConnected() {
    return this.socket?.connected || false
  }
}

export const socketManager = new SocketManager()

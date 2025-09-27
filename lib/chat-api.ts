import { api } from "./api"

export interface Chat {
  _id: string
  title: string
  participants: Array<{
    _id: string
    name: string
    avatar?: { url: string }
    phone?: string
  }>
  lastMessage?: {
    _id: string
    content: string
    sender: {
      _id: string
      name: string
    }
    createdAt: string
    isMe: boolean
  }
  isGroupChat: boolean
  createdAt: string
  updatedAt: string
}

export interface Message {
  _id: string
  content: string
  sender: {
    _id: string
    name: string
    avatar?: { url: string }
  }
  chatId: string
  createdAt: string
  isMe: boolean
}

export interface CreateChatRequest {
  participantId: string
}

export interface CreateGroupChatRequest {
  name: string
  participants: string[]
}

export interface SendMessageRequest {
  chatId: string
  content: string
}

export const chatApi = {
  // Create individual chat
  createChat: (data: CreateChatRequest) => api.post<{ data: Chat }>("/chat/create", data),

  // Create group chat
  createGroupChat: (data: CreateGroupChatRequest) => api.post<{ data: Chat }>("/chat/create-group", data),

  // Get chat list
  getChatList: () => api.get<{ data: { activeChats: Chat[]; nonActiveChats: Chat[] } }>("/chat/list"),

  // Get messages for a chat
  getMessages: (chatId: string, params?: { limit?: number; before?: string }) =>
    api.get<{ data: Message[] }>(`/chat/messages/${chatId}`, { params }),

  // Send message
  sendMessage: (data: SendMessageRequest) => api.post<{ data: Message }>("/chat/send-message", data),

  // Add user to group
  addToGroup: (chatId: string, userId: string) => api.post(`/chat/add-to-group`, { chatId, userId }),

  // Remove user from group
  removeFromGroup: (chatId: string, userId: string) => api.post(`/chat/remove-from-group`, { chatId, userId }),

  // Leave group
  leaveGroup: (chatId: string) => api.post(`/chat/leave-group/${chatId}`),
}

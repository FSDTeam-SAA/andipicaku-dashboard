"use client"

import { useState } from "react"
import { ChatList } from "@/components/chat/chat-list"
import { MessageView } from "@/components/chat/message-view"
import type { Chat } from "@/lib/chat-api"
import { MessageSquare } from "lucide-react"

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat)
  }

  const handleNewChat = () => {
    // TODO: Implement new chat modal
    console.log("[v0] New chat clicked")
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="h-full flex">
        <ChatList selectedChatId={selectedChat?._id} onChatSelect={handleChatSelect} onNewChat={handleNewChat} />

        {selectedChat ? (
          <MessageView chat={selectedChat} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#32071c]">
            <div className="text-center text-gray-400">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Seleziona una conversazione</h3>
              <p>Scegli una chat dalla lista per iniziare a messaggiare</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

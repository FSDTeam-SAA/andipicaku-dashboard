"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Users, MessageSquare } from "lucide-react";
import { chatApi, type Chat } from "@/lib/chat-api";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatListProps {
  selectedChatId?: string;
  onChatSelect: (chat: Chat) => void;
  onNewChat: () => void;
}

export function ChatList({
  selectedChatId,
  onChatSelect,
  onNewChat,
}: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: session } = useSession();

  const { data: chatsData, isLoading } = useQuery({
    queryKey: ["chats"],
    queryFn: () => chatApi.getChatList(),
    select: (data) => data.data.data,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const allChats = [
    ...(chatsData?.activeChats || []),
    ...(chatsData?.nonActiveChats || []),
  ];

  const filteredChats = allChats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString("it-IT", { weekday: "short" });
    } else {
      return date.toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-80 bg-[#030E15] backdrop-blur-sm border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="flex-1 overflow-y-auto">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-4 border-b border-white/5">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-[#030E15] backdrop-blur-sm border-r border-white/10 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Messaggi</h2>
          <Button
            size="sm"
            onClick={onNewChat}
            className="bg-[#901450] hover:bg-pink-700 text-white"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cerca Community"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nessuna conversazione trovata</p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isSelected = selectedChatId === chat._id;
            const otherParticipant = chat.participants.find(
              (p) => p._id !== session?.user?.id
            );

            return (
              <div
                key={chat._id}
                onClick={() => onChatSelect(chat)}
                className={cn(
                  "p-4 border-b border-white/5 cursor-pointer transition-colors hover:bg-slate-700/50",
                  isSelected && "bg-slate-700/70"
                )}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={
                          otherParticipant?.avatar?.url || "/placeholder.svg"
                        }
                      />
                      <AvatarFallback className="bg-[#901450] text-white">
                        {chat.isGroupChat ? (
                          <Users className="h-6 w-6" />
                        ) : (
                          otherParticipant?.name?.charAt(0)?.toUpperCase() ||
                          "U"
                        )}
                      </AvatarFallback>
                    </Avatar>
                    {!chat.isGroupChat && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800" />
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-white truncate">
                        {chat.title}
                      </h3>
                      {chat.lastMessage && (
                        <span className="text-xs text-gray-400">
                          {formatTime(chat.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>

                    {chat.lastMessage ? (
                      <p className="text-sm text-gray-400 truncate">
                        {chat.lastMessage.isMe ? "Tu: " : ""}
                        {chat.lastMessage.content}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        Nessun messaggio
                      </p>
                    )}
                  </div>

                  {/* Unread indicator */}
                  <div className="flex flex-col items-end space-y-1">
                    {chat.isGroupChat && (
                      <Badge variant="secondary" className="text-xs">
                        Gruppo
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

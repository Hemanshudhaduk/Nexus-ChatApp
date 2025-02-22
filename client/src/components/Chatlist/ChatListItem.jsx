import React, { useEffect, useState } from "react";
import Avatar from "../common/Avatar";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/StateReducers";
import { BsCheck2, BsCheck2All } from "react-icons/bs";
import axios from "axios";
import { MARK_READ_ROUTE } from "@/utils/ApiRoutes";
import { io } from "socket.io-client";

function ChatListItem({ data, isContactsPage = false, socket }) {
  const [{ userInfo }, dispatch] = useStateProvider();
  const [unreadCount, setUnreadCount] = useState(
    userInfo?.id !== data.senderId ? data.totalUnreadMessages : 0
  );

  console.log(userInfo,"....................userinfo");
  console.log(data,"mmmmmmmmm...........................")

  useEffect(() => {
    if (socket) {
      socket.on("new-message", (message) => {
        if (message.senderId === data.id && message.receiverId === userInfo.id) {
          setUnreadCount((prev) => prev + 1);
        }
      });

      socket.on("message-read", ({ senderId, receiverId }) => {
        if (senderId === data.id && receiverId === userInfo.id) {
          setUnreadCount(0);
        }
      });
    }
  }, [socket, data.id, userInfo.id]);

  const handleContactClick = async () => {
    dispatch({ 
      type: reducerCases.CHANGE_CURRENT_CHAT_USER, 
      user: { ...data } 
    });

    if (isContactsPage) {
      dispatch({ 
        type: reducerCases.SET_ALL_CONTACTS_PAGE, 
        payload: false 
      });
    }

    // Only mark as read if there are unread messages and user is receiver
    if (unreadCount > 0 && userInfo?.id !== data.senderId) {
      try {
        setUnreadCount(0); // Update UI immediately
        
        await axios.post(MARK_READ_ROUTE, {
          from: data.id,
          to: userInfo.id
        });

        // Emit socket event for real-time update
        socket?.emit("message-read", {
          senderId: data.id,
          receiverId: userInfo.id
        });

      } catch (error) {
        console.error("Error marking messages as read:", error);
        setUnreadCount(prev => prev); // Revert on error
      }
    }
  };

  const getLastMessageText = () => {
    if (!data.lastMessage) return "No messages yet";
    if (data.type === "image") return "📷 Image";
    if (data.type === "audio") return "🎵 Audio";
    return data.lastMessage;
  };

  return (
    <div
      className="flex cursor-pointer items-center hover:bg-background-deep p-3 rounded-lg transition duration-300"
      onClick={handleContactClick}
    >
      <div className="min-w-fit px-5 pt-3 pb-1 relative">
        <Avatar type="lg" image={data?.profilePicture} />
        {data?.isOnline && (
          <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></span>
        )}
      </div>

      <div className="flex flex-col justify-center w-full pr-2 mt-3">
        <div className="flex justify-between">
          <span className="text-white font-semibold truncate w-36">
            {data?.name}
          </span>
          {!isContactsPage && (
            <span className="text-secondary text-xs">
              {new Date(data.createdAt).toLocaleTimeString([], { 
                hour: "2-digit", 
                minute: "2-digit" 
              })}
            </span>
          )}
        </div>

        <div className="flex justify-between border-b border-conversation-border pb-2 pt-1 w-full">
          <div className="text-secondary text-sm flex items-center truncate w-40">
            {data?.senderId === userInfo?.id && (
              <span className="mr-1">
                {data.messageStatus === "sent" && <BsCheck2 className="text-gray-400" />}
                {data.messageStatus === "delivered" && <BsCheck2All className="text-gray-400" />}
                {data.messageStatus === "read" && <BsCheck2All className="text-blue-500" />}
              </span>
            )}
            <span>{getLastMessageText()}</span>
          </div>
          {unreadCount > 0 && userInfo?.id !== data.senderId && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatListItem;
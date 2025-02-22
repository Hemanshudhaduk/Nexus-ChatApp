import { useStateProvider } from "@/context/StateContext";
import { ADD_IMAGE_MESSAGE_ROUTE, ADD_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import React, { useState, useRef, useEffect } from "react";
import { BsEmojiSmile } from "react-icons/bs";
import { ImAttachment } from "react-icons/im";
import { MdSend } from "react-icons/md";
import PhotoPicker from "../common/PhotoPicker";
import { FaMicrophone } from "react-icons/fa";

function MessageBar() {
  const [{ userInfo, currentChatUser, socket }, dispatch] = useStateProvider();
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const emojiRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Function to send text messages
  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      const { data } = await axios.post(ADD_MESSAGE_ROUTE, {
        to: currentChatUser?.id,
        from: userInfo?.id,
        message,
      });

      if (data.message) {
        if (socket?.current) {
          socket.current.emit("send-msg", {
            to: currentChatUser?.id,
            from: userInfo?.id,
            message: data.message,
          });
        }

        dispatch({
          type: "ADD_MESSAGE",
          newMessage: data.message,
        });
      }

      setMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Function to handle image uploads
  const photoPickerChange = async (e) => {
    try {
      const file = e.target.files[0];

      if (!file) {
        console.error("No file selected.");
        return;
      }

      console.log("Selected file:", file);

      const formData = new FormData();
      formData.append("image", file);
      formData.append("from", userInfo?.id);
      formData.append("to", currentChatUser?.id);

      const response = await axios.post(ADD_IMAGE_MESSAGE_ROUTE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201) {
        console.log("Image uploaded successfully:", response.data);

        if (socket?.current) {
          socket.current.emit("send-msg", {
            to: currentChatUser?.id,
            from: userInfo?.id,
            message: response.data.message,
            type: "image",
          });
        } else {
          console.error("Socket is not initialized!");
        }

        dispatch({
          type: "ADD_MESSAGE",
          newMessage: response.data.message,
        });
      } else {
        console.error("Failed to upload image:", response.data);
      }
    } catch (err) {
      console.error("Error in addImageMessage:", err);
    }
  };

  return (
    <div className="bg-panel-header-background h-20 px-4 flex items-center gap-6 relative">
      <div className="flex gap-6 relative">
        <BsEmojiSmile
          className="text-panel-header-icon cursor-pointer text-2xl"
          title="Emoji"
          onClick={() => setShowEmoji(!showEmoji)}
        />
        {showEmoji && (
          <div
            ref={emojiRef}
            className="absolute bottom-16 left-0 bg-gray-800 p-2 rounded-xl shadow-lg z-50"
          >
            <EmojiPicker onEmojiClick={(e) => setMessage((prev) => prev + e.emoji)} theme="dark" />
          </div>
        )}
        <ImAttachment
          className="text-panel-header-icon cursor-pointer text-xl"
          title="Attach File"
          onClick={() => document.getElementById("photo-picker")?.click()}
        />
      </div>

      <div className="w-full rounded-lg h-10 flex items-center">
        <input
          type="text"
          placeholder="Type a message..."
          className="bg-input-background text-sm focus:outline-none text-white h-10 rounded-full px-5 py-4 w-full"
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && message.trim() && sendMessage()}
          value={message}
        />
      </div>

      <div className="flex w-10 items-center justify-center">
        {message.trim() ? (
          <button className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full" onClick={sendMessage}>
            <MdSend className="text-panel-header-icon cursor-pointer text-xl" title="Send Message" />
          </button>
        ) : (
          <button className="text-white p-2 rounded-full" onClick={() => console.log("Open voice recorder")}>
            <FaMicrophone className="text-panel-header-icon cursor-pointer text-xl" title="Record Audio" />
          </button>
        )}
      </div>

      <PhotoPicker onChange={photoPickerChange} />
    </div>
  );
}

export default MessageBar;

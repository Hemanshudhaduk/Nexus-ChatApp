import React from "react";
import Avatar from "../common/Avatar";
import { MdCall, MdVideocam } from "react-icons/md"; // ✅ Correct import
import { BiSearchAlt2 } from "react-icons/bi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/StateReducers";
import ContextMenu from "../common/ContextMenu";
// import { FcCallback } from "react-icons/fc";

function ChatHeader() {
  const [{ currentChatUser , onlineUsers }, dispatch] = useStateProvider();

  const [isContextMenuVisible, setIsContextMenuVisible] = React.useState(false);

  const [contextMenuCordinates, setContextMenuCordinates] = React.useState({
    x: 0,
    y: 0,
  });

  const [isContxetMenuOpen, setIsContextMenuOpen] = React.useState(false);

  const showContextMenu = (e) => {
    e.preventDefault(); 
    setContextMenuCordinates({ x: e.pageX - 50, y: e.pageY + 20 });
    setIsContextMenuOpen(true);
  };

  const contextMenuOptios = [
    {
      name: "Exit",
      callback: async () => {
        dispatch({ type: reducerCases.SET_EXIT_CHAT });
      },
    },
  ];

  const handleVoiceCall = () => {
    dispatch({
      type: reducerCases.SET_VOICECALL,
      voiceCall: {
        ...currentChatUser,
        type: "out-going",
        callType: "voice",
        roomId: Date.now(),
      },
    });
  };
  const handleVideoCall = () => {
    dispatch({
      type: reducerCases.SET_VIDEOCALL,
      videoCall: {
        ...currentChatUser,
        type: "out-going",
        callType: "video",
        roomId: Date.now(),
      },
    });
  };

  return (
    <div className="h-16 px-4 py-3 flex justify-between items-center bg-panel-header-background">
      <div className="flex items-center justify-center gap-6">
        <Avatar type="sm" image={currentChatUser?.profilePicture} />
        <div className="flex flex-col">
          <span className="text-primary-strong">{currentChatUser?.name}</span>
          <span className="text-secondary text-sm">
            {
              onlineUsers.includes(currentChatUser?.id) ? "Online" : "Offline"
            }
          </span>
        </div>
      </div>
      <div className="flex gap-6">
        <MdCall
          className="text-panel-header-icon text-xl cursor-pointer"
          title="voice call"
          onClick={handleVoiceCall}
        />
        <MdVideocam
          className="text-panel-header-icon text-xl cursor-pointer"
          title="video call"
          onClick={handleVideoCall}
        />
        <BiSearchAlt2
          className="text-panel-header-icon text-xl cursor-pointer"
          onClick={() => dispatch({ type: reducerCases.SET_MESSAGE_SEARCH })}
        />
        <BsThreeDotsVertical className="text-panel-header-icon text-xl cursor-pointer"
        onClick={(e) => showContextMenu(e)}
        id="context-opener"
        />
        {isContxetMenuOpen && (
          <ContextMenu 
            options={contextMenuOptios}
            coordinates={contextMenuCordinates}
            contextMenu={isContextMenuVisible}
            setContextMenu={setIsContextMenuVisible}
          />
        )}
      </div>
    </div>
  );
}

export default ChatHeader;

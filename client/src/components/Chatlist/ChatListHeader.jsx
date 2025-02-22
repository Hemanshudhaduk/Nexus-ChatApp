import React from "react";
import Avatar from "../common/Avatar";
import { useStateProvider } from "@/context/StateContext";
import { BsFillChatLeftTextFill, BsThreeDotsVertical } from "react-icons/bs";
import { reducerCases } from "@/context/StateReducers";
import { useRouter } from "next/router";
import ContextMenu from "../common/ContextMenu";

function ChatListHeader() {
  const [{ userInfo, contactsPage }, dispatch] = useStateProvider();

  const router = useRouter();

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
      name: "Logout",
      callback: async () => {
        setIsContextMenuOpen(false);
        router.push("/logout");
      },
    },
  ];

  const handleAllContactsPage = () => {
    dispatch({
      type: reducerCases.SET_ALL_CONTACTS_PAGE,
      contactsPage: true,
    });
  };

  return (
    <div className="h-16 px-4 py-3 flex justify-between items-center">
      <div className="cursor-pointer">
        <Avatar type="sm" image={userInfo?.profileImage} />
      </div>
      <div className="flex gap-6">
        <BsFillChatLeftTextFill
          className={`text-panel-header-icon cursor-pointer text-xl ${
            contactsPage ? "text-green-500" : ""
          }`}
          title="New Chat"
          onClick={handleAllContactsPage}
        />
        <BsThreeDotsVertical
          className="text-panel-header-icon cursor-pointer text-xl"
          title="Menu"
          onClick={(e) => showContextMenu(e)}
          id="context-opwner"
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

export default ChatListHeader;

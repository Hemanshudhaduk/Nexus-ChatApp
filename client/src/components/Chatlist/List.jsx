import { useStateProvider } from "@/context/StateContext";
import { GET_INITIAL_CONTACTS_ROUTE } from "@/utils/ApiRoutes";
import axios from "axios";
import React, { useEffect } from "react";
import { reducerCases } from "@/context/StateReducers";
import ChatListItem from "./ChatListItem";
import { io } from "socket.io-client";

function List({ contacts }) {
  const [{ userInfo, socket }, dispatch] = useStateProvider();
  console.log(contacts, "contacts");

  // Establish Socket Connection
  useEffect(() => {
    if (!socket) {
      const newSocket = io("http://localhost:3005");

      dispatch({
        type: reducerCases.SET_SOCKET,
        socket: newSocket,
      });

      newSocket.on("connect", () => {
        console.log("Socket connected");
        if (userInfo?.id) {
          newSocket.emit("add-user", userInfo.id);
        }
      });

      return () => newSocket.disconnect();
    }
  }, [userInfo, dispatch, socket]);

  // Fetch User Contacts
  useEffect(() => {
    const getContacts = async () => {
      if (!userInfo?.id) return;
      try {
        const response = await axios.get(
          `${GET_INITIAL_CONTACTS_ROUTE}/${userInfo.id}`
        );

        if (response.data?.users) {
          dispatch({
            type: reducerCases.SET_USER_CONTACTS,
            userContacts: response.data.users,
          });
        }
      } catch (error) {
        console.error("Error getting contacts:", error);
      }
    };

    getContacts();
  }, [userInfo, dispatch]);

  return (
    <div className="overflow-y-auto h-full">
      {contacts.length > 0 ? (
        contacts.map((contact) => (
          <ChatListItem key={contact.id} data={contact} />
        ))
      ) : (
        <p className="text-gray-400 text-center mt-5">No chats found</p>
      )}
    </div>
  );
}

export default List;

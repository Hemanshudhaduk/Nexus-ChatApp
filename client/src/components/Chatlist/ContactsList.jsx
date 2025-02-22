import React, { useEffect, useState } from "react";
import axios from "axios";
import { BiArrowBack, BiSearch, BiSearchAlt2 } from "react-icons/bi";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/StateReducers";
import ChatListItem from "./ChatListItem";
import { GET_ALL_USERS } from "@/utils/ApiRoutes";

function ContactsList() {
  const [{ contactsPage, currentChatUser }, dispatch] = useStateProvider();
  const [allContacts, setAllContacts] = useState([]);
  const [search, setSearch] = useState("");

  const filteredContacts = Object.values(allContacts)
    .flat()
    .filter((contact) =>
      contact.name.toLowerCase().includes(search.toLowerCase())
    );

  const groupedContacts = filteredContacts.reduce((acc, contact) => {
    const initial = contact.name[0].toUpperCase();
    if (!acc[initial]) {
      acc[initial] = [];
    }
    acc[initial].push(contact);
    return acc;
  }, {});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(GET_ALL_USERS);

        if (response.data?.status) {
          setAllContacts(response.data.users);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="bg-panel-header-background h-full flex flex-col">
      <div className="flex items-center p-4 border-b border-gray-600">
        <BiArrowBack
          className="text-white text-2xl cursor-pointer"
          onClick={() => {
            dispatch({
              type: reducerCases.SET_ALL_CONTACTS_PAGE,
            });
          }}
        />
        <h2 className="text-white text-lg font-semibold ml-4">New Chat</h2>
      </div>
      <div className="bg-search-input-container-background h-full flex-auto overflow-auto custom-scrollbar">
        <div className="flex py-3 items-center gap-3 h-14">
          <div className="bg-panel-header-background flex items-center gap-5 px-3 py-2 rounded-md w-full mx-4">
            <div>
              <BiSearchAlt2 className="text-panel-header-icon cursor-pointer text-l" />
            </div>
            <div>
              <input
                type="text"
                placeholder="Search Contacts"
                className="bg-transparent text-sm focus:outline-none text-white w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
        {Object.keys(groupedContacts).length > 0 ? (
          Object.keys(groupedContacts)
            .sort() // Sort by initial letter
            .map((initial) => (
              <div key={initial}>
                <div className="text-teal-light pl-10 py-2 text-lg font-bold">
                  {initial}
                </div>
                {groupedContacts[initial].map((contact) => (
                  <ChatListItem
                    key={contact.id}
                    data={contact}
                    isContactsPage={true}
                  />
                ))}
              </div>
            ))
        ) : (
          <div className="text-gray-400 text-center mt-4">
            No contacts found
          </div>
        )}
      </div>
    </div>
  );
}

export default ContactsList;

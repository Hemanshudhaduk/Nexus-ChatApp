import React, { useState } from "react";
import ChatListHeader from "./ChatListHeader";
import SearchBar from "./SearchBar";
import List from "./List"; 
import { useStateProvider } from "@/context/StateContext";
import ContactsList from "./ContactsList";

function ChatList() {
  const [{ contactsPage, userContacts }] = useStateProvider();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter contacts based on search input
  const filteredContacts = userContacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery)
  );

  return (
    <div className="bg-search-input-container-background flex flex-col max-h-screen">
      {contactsPage ? (
        <ContactsList /> // Show ContactList when contactsPage is true
      ) : (
        <>
          <ChatListHeader />
          <SearchBar setSearchQuery={setSearchQuery} />
          <List contacts={filteredContacts} /> {/* Pass filtered contacts */}
        </>
      )}
    </div>
  );
}

export default ChatList;

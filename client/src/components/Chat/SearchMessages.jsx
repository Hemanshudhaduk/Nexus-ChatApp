import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/StateReducers";
import React, { useEffect, useState } from "react";
import { BiSearchAlt2 } from "react-icons/bi";
import { IoClose } from "react-icons/io5";
import { calculateTime } from "@/utils/CalculateTime";

function SearchMessages() {
  const [{ currentChatUser, messages }, dispatch] = useStateProvider();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchTerm.length > 0) {
      setIsSearching(true);
      // Filter messages based on search term and exclude image URLs
      const filteredMessages = messages.filter((message) => {
        // Skip messages that are images
        if (message.type === "image" || message.message.startsWith("http")) {
          return false;
        }
        return message.message.toLowerCase().includes(searchTerm.toLowerCase());
      });
      setSearchResults(filteredMessages);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, messages]);

  const handleClose = () => {
    dispatch({ type: reducerCases.SET_MESSAGE_SEARCH, payload: false });
  };

  return (
    <div className="border-conversation-border border-l w-full bg-conversation-panel-background flex flex-col z-10 max-h-screen">
      {/* Header */}
      <div className="h-16 px-4 py-5 flex gap-10 items-center bg-panel-header-background text-primary-strong">
        <IoClose
          className="cursor-pointer text-icon-lighter text-2xl"
          onClick={handleClose}
        />
        <span>Search Messages</span>
      </div>

      {/* Search Input */}
      <div className="p-4">
        <div className="bg-panel-header-background flex items-center gap-5 px-3 py-2 rounded-lg">
          <BiSearchAlt2 className="text-panel-header-icon cursor-pointer text-xl" />
          <input
            type="text"
            placeholder="Search Messages"
            className="bg-transparent text-sm focus:outline-none text-white w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isSearching ? (
          <div className="flex justify-center items-center h-full">
            <span className="text-secondary">Searching...</span>
          </div>
        ) : searchTerm.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <span className="text-secondary">
              Search for messages in {currentChatUser?.name}'s chat
            </span>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <span className="text-secondary">No messages found</span>
          </div>
        ) : (
          <div className="px-4 py-2">
            {searchResults.map((message, index) => (
              <div
                key={index}
                className="bg-panel-header-background p-3 rounded-lg mb-2 hover:bg-conversation-panel-background cursor-pointer"
                onClick={() => {
                  // Handle message selection/navigation
                  dispatch({
                    type: reducerCases.SET_MESSAGE_SEARCH,
                    payload: false,
                  });
                }}
              >
                <div className="text-sm text-white">{message.message}</div>
                <div className="text-xs text-secondary mt-1">
                  {calculateTime(message.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchMessages;
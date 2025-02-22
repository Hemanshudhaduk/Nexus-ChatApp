import React, { useState } from "react";
import { BiSearchAlt2 } from "react-icons/bi";
import { BsFilter } from "react-icons/bs";
import { useStateProvider } from "@/context/StateContext";

function SearchBar({ setSearchQuery }) {
  const [input, setInput] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);
    setSearchQuery(value.toLowerCase()); // Pass query to parent for filtering
  };

  return (
    <div className="bg-search-input-container-background flex py-3 pl-5 items-center">
      <div className="bg-panel-header-background flex items-center gap-5 px-3 py-2 rounded-md w-full">
        {/* Search Icon */}
        <BiSearchAlt2 className="text-panel-header-icon cursor-pointer text-l" />

        {/* Input Field */}
        <input
          type="text"
          value={input}
          onChange={handleChange}
          placeholder="Search or start a new chat"
          className="bg-transparent text-sm focus:outline-none text-white w-full"
        />
      </div>

      {/* Filter Icon */}
      <div className="pr-5 pl-3">
        <BsFilter className="text-panel-header-icon cursor-pointer text-l" />
      </div>
    </div>
  );
}

export default SearchBar;

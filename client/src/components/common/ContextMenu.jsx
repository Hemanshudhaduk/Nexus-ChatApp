import React, { useEffect, useRef } from "react";

function ContextMenu({ options, coordinates, contextMenu, setContextMenu }) {
  const contextMenuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (event.target.id !== "context-opener") {
        if (
          contextMenuRef.current &&
          !contextMenuRef.current.contains(event.target)
        ) {
          setContextMenu(false);
        }
      }
    };

    // ✅ Correctly add event listener
    document.addEventListener("click", handleOutsideClick);

    return () => {
      // ✅ Correctly remove event listener
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []); // ✅ Add `setContextMenu` as a dependency

  const handleClick = (e, callback) => {
    e.stopPropagation();
    setContextMenu(false);
    callback();
  };

  return (
    <div
      className="bg-dropdown-background fixed py-2 z-[100]"
      ref={contextMenuRef}
      style={{
        top: coordinates?.y || 0, // ✅ Prevent undefined error
        left: coordinates?.x || 0, // ✅ Prevent undefined error
      }}
    >
      <ul>
        {options.map(({ name, callback }) => (
          <li
            key={name}
            onClick={(e) => handleClick(e, callback)}
            className="px-5 py-2 cursor-pointer hover:bg-background-default-hover"
          >
            <span className="text-white">{name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ContextMenu;

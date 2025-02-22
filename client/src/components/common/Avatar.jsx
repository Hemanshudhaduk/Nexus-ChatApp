import Image from "next/image";
import React, { useEffect, useState } from "react";
import { FaCamera } from "react-icons/fa";
import ContextMenu from "./ContextMenu";
import PhotoPicker from "./PhotoPicker";
import CapturePhoto from "./CapturePhoto";

function Avatar({ type, image = "/default_avatar.png", setImage }) {
  const [hover, setHover] = useState(false);
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [contextMenuCordinate, setContextMenuCordinate] = useState({ x: 0, y: 0 });
  const [grapphoto, setGrapphoto] = useState(false);
  const [Showphototlibraray, setShowphototlibraray] = useState(false);
  const [showCapturePhoto, setShowCapturePhoto] = useState(false);

  const showContextMenu = (e) => {
    e.preventDefault();
    setIsContextMenuVisible(true);
    setContextMenuCordinate({ x: e.pageX, y: e.pageY });
  };

  useEffect(() => {
    if (grapphoto) {
      const data = document.getElementById("photo-picker");
      if (data) data.click();

      const handleFocus = () => {
        setTimeout(() => setGrapphoto(false), 1000);
      };

      document.body.addEventListener("focus", handleFocus);
      return () => document.body.removeEventListener("focus", handleFocus);
    }
  }, [grapphoto]);

  const contextMenuOptions = [
    { name: "Take Photo", callback: () => setShowCapturePhoto(true) },
    { name: "Choose From Library", callback: () => setShowphototlibraray(true) },
    { name: "Upload Photo", callback: () => setGrapphoto(true) },
    { name: "Remove Photo", callback: () => setImage("/default_avatar.png") },
  ];

  const photoPickerChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <div className="flex items-center justify-center">
        {["sm", "lg", "xl"].includes(type) && (
          <div
            className={`relative ${
              type === "sm" ? "h-10 w-10" : type === "lg" ? "h-14 w-14" : "h-60 w-60"
            }`}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            {type === "xl" && (
              <div
                className={`z-5 bg-photopicker-overlay-background absolute top-0 left-0 flex items-center rounded-full justify-center flex-col text-center gap-2 ${
                  hover ? "visible" : "hidden"
                }`}
                id="context-opener"
                onClick={showContextMenu}
              >
                <FaCamera className="text-2xl" />
                <span>Change <br /> Profile <br /> Photo</span>
              </div>
            )}
            <Image src={image} alt="avatar" width={240} height={240} className="rounded-full object-cover" />
          </div>
        )}
      </div>

      {isContextMenuVisible && (
        <ContextMenu
          options={contextMenuOptions}
          coordinates={contextMenuCordinate}
          ContextMenu={isContextMenuVisible}
          setContextMenu={setIsContextMenuVisible}
        />
      )}
      {showCapturePhoto && <CapturePhoto setImage={setImage} hide={setShowCapturePhoto} />}
      {grapphoto && <PhotoPicker onChange={photoPickerChange} />}
    </>
  );
}

export default Avatar;

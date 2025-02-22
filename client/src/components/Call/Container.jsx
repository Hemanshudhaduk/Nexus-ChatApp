import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/StateReducers";
import { GET_CALL_TOKEN } from "@/utils/ApiRoutes";
import axios from "axios";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { MdOutlineCallEnd } from "react-icons/md";

function Container({ data }) {
  const [{ socket, userInfo }, dispatch] = useStateProvider();
  const [callAccepted, setCallAccepted] = useState(false);
  const [token, setToken] = useState(undefined);
  const [zgVar, setZgVar] = useState(undefined);
  const [localStream, setLocalStream] = useState(undefined);
  const [publishStream, setPublishStream] = useState(undefined);

  useEffect(() => {
    if (data.type === "out-going") {
      socket.current.on("accept-call", () => setCallAccepted(true));
    } else {
      setTimeout(() => {
        setCallAccepted(true);
      }, 1000);
    }
  }, [data]);

  useEffect(() => {
    const getToken = async () => {
      console.log("Getting token...");
      console.log(userInfo.id,"..................................sss");
      try {
        const response = await axios.get(`${GET_CALL_TOKEN}/${userInfo.id}`);
        setToken(response.data.token);
      } catch (error) {
        console.log("Error getting token:", error);
      }
    };
    if (callAccepted) {
      getToken();
    }
  }, [callAccepted, userInfo.id]);

  useEffect(() => {
    const startCall = async () => {
      try {
        console.log("Initializing call...");
        
        // ✅ Explicitly request camera & mic permissions
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: data.callType === "video"
        });
    
        console.log("User media stream:", mediaStream);
    
        // ✅ Import Zego Engine dynamically
        const { ZegoExpressEngine } = await import("zego-express-engine-webrtc");
    
        const zg = new ZegoExpressEngine(
          parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID),
          process.env.NEXT_PUBLIC_ZEGO_SERVER_ID
        );
    
        setZgVar(zg);
    
        // ✅ Ensure camera permissions before logging into the room
        await zg.checkSystemRequirements().then((result) => {
          if (!result.webRTC || !result.camera || !result.microphone) {
            throw new Error("WebRTC, Camera, or Microphone not supported!");
          }
        });
    
        // ✅ Set event handlers before logging in
        zg.on("roomStreamUpdate", async (roomID, updateType, streamList) => {
          console.log("Room stream update:", updateType, streamList);
          if (updateType === "ADD" && streamList.length > 0) {
            const remoteStream = await zg.startPlayingStream(streamList[0].streamID, {
              audio: true,
              video: data.callType === "video"
            });
    
            console.log("Remote stream received:", remoteStream);
    
            const remoteVideo = document.getElementById("remote-video");
            if (remoteVideo) {
              remoteVideo.srcObject = remoteStream;
            }
          }
        });
    
        // ✅ Login to ZegoCloud Room
        const loginSuccess = await zg.loginRoom(
          data.roomId.toString(),
          token,
          {
            userID: userInfo.id.toString(),
            userName: userInfo.name
          },
          { userUpdate: true }
        );
    
        if (!loginSuccess) {
          throw new Error("Failed to login to Zego room");
        }
    
        console.log("ZegoCloud Room Login Successful");
    
        // ✅ Create local stream
        const zegoStream = await zg.createStream({
          camera: {
            audio: true,
            video: data.callType === "video"
          }
        });
    
        console.log("Local stream created:", zegoStream);
    
        // ✅ Attach local stream to video element
        const localVideo = document.getElementById("local-video");
        if (localVideo && data.callType === "video") {
          localVideo.srcObject = zegoStream;
        }
    
        // ✅ Start publishing stream
        const streamID = `${userInfo.id}_${Date.now()}`;
        await zg.startPublishingStream(streamID, zegoStream);
    
        setLocalStream(zegoStream);
        setPublishStream(streamID);
    
        console.log("Publishing stream:", streamID);
      } catch (error) {
        console.error("Call setup error:", error);
        if (error.name === "NotAllowedError") {
          alert("Please allow camera and microphone access to make calls.");
        }
      }
    };
    

    if (token) {
      startCall();
    }

    return () => {
      if (zgVar) {
        if (localStream) {
          zgVar.destroyStream(localStream);
        }
        if (publishStream) {
          zgVar.stopPublishingStream(publishStream);
        }
        zgVar.logoutRoom(data.roomId.toString());
        zgVar.off('roomStreamUpdate');
      }
    };
  }, [token]);

  const endCall = () => {
    console.log("Ending call...");
  
    if (zgVar) {
      if (localStream) {
        console.log("Destroying local stream...");
        zgVar.destroyStream(localStream);
      }
      if (publishStream) {
        console.log("Stopping publishing stream...");
        zgVar.stopPublishingStream(publishStream);
      }
      console.log("Logging out from room...");
      zgVar.logoutRoom(data.roomId.toString());
    }
  
    if (data.callType === "voice") {
      socket.current.emit("reject-voice-call", { from: data.id });
    } else {
      socket.current.emit("reject-video-call", { from: data.id });
    }
  
    dispatch({ type: reducerCases.END_CALL });
  };
  

  return (
    <div className="border-conversation-border border-l w-full bg-conversation-panel-background flex flex-col h-[100vh] overflow-hidden items-center justify-center text-white">
      <div className="flex flex-col items-center gap-3">
        <span className="text-5xl">{data.name}</span>
        <span className="text-lg">
          {callAccepted && data.callType !== "video"
            ? "On going call"
            : "Calling..."}
        </span>
      </div>
      
      {(!callAccepted || data.callType === "audio") && (
        <div className="my-24">
          <Image
            src={data.profilePicture}
            alt="avatar"
            height={300}
            width={300}
            className="rounded-full"
          />
        </div>
      )}
      
      <div className="relative w-full max-w-[800px] aspect-video">
        {data.callType === "video" && (
          <>
            <video
              id="remote-video"
              className="w-full h-full bg-black"
              autoPlay
              playsInline
            />
            <video
              id="local-video"
              className="absolute bottom-4 right-4 w-48 h-36 bg-black"
              autoPlay
              playsInline
              muted
            />
          </>
        )}
        {data.callType === "audio" && (
          <audio id="remote-video" autoPlay />
        )}
      </div>

      <div className="h-16 w-16 bg-red-600 flex items-center justify-center rounded-full mt-5 cursor-pointer">
        <MdOutlineCallEnd
          className="text-3xl"
          onClick={endCall}
        />
      </div>
    </div>
  );
}

export default Container;
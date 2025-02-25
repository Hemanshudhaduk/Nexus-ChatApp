import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/StateReducers";
import Image from "next/image";
import React from "react";

function IncomingVideoCall() {
  const [{ incomingVideoCall, socket }, dispatch] = useStateProvider();
  // console.log(incomingVideoCall,"ddddddddddddddddddddddddddddd");
  const acceptCall = () => {
    dispatch({
      type: reducerCases.SET_VIDEOCALL,
      videoCall: {
        ...incomingVideoCall,
        type: "in-coming",
      },
    });
    socket.current.emit("accept-incoming-call", {
      id: incomingVideoCall.id,
      // roomId: incomingVideoCall.roomId,
    });
    dispatch({
      type: reducerCases.SET_INCOMING_VIDEO_CALL,
      incomingVideoCall: undefined,
    });
  };

  const rejectCall = () => {
    socket.current.emit("reject-video-call", { from: incomingVideoCall.id });
    dispatch({
      type: reducerCases.END_CALL,
    });
  };

  return (
    <div className="h-24 w-18 fixed bottom-8 mb-0 right-6 z-50 rounded-sm gap-5 flex items-center justify-start p-4 bg-conversation-panel-background text-white drop-shadow-2xl border-icon-green border-2 py-14">
      <div>
        <Image
          src={incomingVideoCall.profilePicture}
          alt="avatar"
          width={70}
          height={70}
          className="rounded-full"
        />
      </div>
      <div>
        <div>{incomingVideoCall.name} is calling you</div>

        <div className="flex gap-5 mt-5">
          <button
            className="bg-green-600 px-4 py-2 rounded-sm"
            onClick={acceptCall}
          >
            Accept
          </button>
          <button
            className="bg-red-600 px-4 py-2 rounded-sm"
            onClick={rejectCall}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

export default IncomingVideoCall;

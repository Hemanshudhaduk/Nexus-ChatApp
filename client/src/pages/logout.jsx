import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/StateReducers";
import { firebaseAuth } from "@/utils/FirebaseConfig";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

function Logout() {
  const [{ socket, userInfo }, dispatch] = useStateProvider();
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      // Check if socket and userInfo exist before using them
      if (socket?.current && userInfo?.id) {
        socket.current.emit("signout", userInfo.id);
      }

      // Clear user info
      dispatch({ type: reducerCases.SET_USER_INFO, userInfo: undefined });

      try {
        await signOut(firebaseAuth); // Ensure sign-out is awaited
      } catch (error) {
        console.error("Error signing out:", error);
      }

      // Redirect to login
      router.push("/login");
    };

    handleLogout();
  }, [socket, userInfo, router, dispatch]); // Include all dependencies

  return <div className="bg-conversation-panel-background"></div>;
}

export default Logout;

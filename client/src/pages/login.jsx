"use client";

import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { firebaseAuth } from "@/utils/FirebaseConfig";
import { useRouter } from "next/navigation";
import axios from "axios";
import { CHECK_USER_ROUTE } from "@/utils/ApiRoutes";
import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";

function Login() {
  const router = useRouter();
  const [{ userInfo, newUser }, dispatch] = useStateProvider();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(firebaseAuth, provider);
    const { displayName: name, email, photoURL: profileImage } = user;
    
    try {
      if (email) {
        const { data } = await axios.post(CHECK_USER_ROUTE, { email });
        if (!data.status) {
          dispatch({ type: reducerCases.SET_NEW_USER, newUser: true });
          dispatch({ type: reducerCases.SET_USER_INFO, userInfo: { name, email, profileImage, status: " " } });
          router.push("/onboarding");
        } else {
          dispatch({ type: reducerCases.SET_USER_INFO, userInfo: data.user });
          router.push("/");
        }
      }
    } catch (err) {
      console.error("🔥 Login Error:", err);
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-900 h-screen w-screen flex-col gap-6">
      <div className="flex items-center justify-center gap-2 text-white">
        <Image src="/Nexus.gif" alt="Whatsapp" height={300} width={300} />
        <span className="text-7xl">Nexus</span>
      </div>
      <button className="flex items-center justify-center gap-4 bg-blue-600 p-5 rounded-lg" onClick={handleLogin}>
        <FcGoogle className="text-3xl" />
        <span className="text-white text-2xl">Login with Google</span>
      </button>
    </div>
  );
}

export default Login;
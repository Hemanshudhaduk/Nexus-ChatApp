// pages/onboarding.jsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useStateProvider } from "@/context/StateContext";
import Input from "@/components/common/Input";
import Avatar from "@/components/common/Avatar";
import axios from "axios";
import { ONBOARD_USER_ROUTE } from "@/utils/ApiRoutes";
import { useRouter } from "next/navigation";
import { reducerCases } from "@/context/constants";

function Onboarding() {
  const [{ userInfo, newUser }, dispatch] = useStateProvider();
  const [name, setName] = useState(userInfo?.name || "");
  const [about, setAbout] = useState(userInfo?.status || "");
  const [image, setImage] = useState(userInfo?.profileImage || "/default_avatar.png");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!userInfo?.email) {
      router.push("/login");
    } else if (!newUser) {
      router.push("/");
    }
  }, [newUser, userInfo, router]);

  const validateDetails = () => {
    if (name.trim().length < 3) {
      setError("Name must be at least 3 characters long.");
      return false;
    }
    setError("");
    return true;
  };

  const onboardUserHandler = async () => {
    if (!userInfo?.email) {
      setError("User information is missing. Please log in again.");
      return;
    }

    if (!validateDetails()) return;

    setLoading(true);
    try {
      const { data } = await axios.post(ONBOARD_USER_ROUTE, {
        email: userInfo.email,
        name,
        about,
        image,
      });

      if (data.status) {
        dispatch({ type: reducerCases.SET_NEW_USER, newUser: false });
        dispatch({
          type: reducerCases.SET_USER_INFO,
          userInfo: {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            profileImage: data.user.profilePicture,
            status: data.user.about,
          },
        });
        router.push("/");
      }
    } catch (err) {
      console.error("🔥 Onboarding error:", err);
      setError("Failed to create profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-panel-header-background h-screen w-screen text-white flex flex-col items-center justify-center">
      <div className="flex items-center justify-center gap-2">
        <Image src="/Logo_Animated.gif" alt="Nexus" height={300} width={300} />
        <span className="text-7xl">Nexus</span>
      </div>

      <h2 className="text-2xl">Create your profile</h2>

      <div className="flex gap-6 mt-6">
        <div className="flex flex-col items-center justify-center mt-5 gap-6">
          <Input name="Display Name" state={name} setState={setName} label />
          <Input name="About" state={about} setState={setAbout} label />
          {error && <p className="text-red-500">{error}</p>}
          <button
            className="flex justify-center items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50"
            onClick={onboardUserHandler}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Profile"}
          </button>
        </div>

        <div>
          <Avatar type="xl" image={image} setImage={setImage} />
        </div>
      </div>
    </div>
  );
}

export default Onboarding;

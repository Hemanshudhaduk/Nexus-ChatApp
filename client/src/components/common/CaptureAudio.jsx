import { useStateProvider } from "@/context/StateContext";
import { ADD_AUDIO_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import {
  FaMicrophone,
  FaPauseCircle,
  FaPlay,
  FaStop,
  FaTrash,
} from "react-icons/fa";
import { MdSend } from "react-icons/md";
import WaveSurfer from "wavesurfer.js";

function CaptureAudio({ hide }) {
  const [{ userInfo, currentChatUser, socket }, dispatch] = useStateProvider();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [waveform, setWaveform] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);

  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const waveFormRef = useRef(null);
  const timerRef = useRef(null);
  const audioChunks = useRef([]);

  useEffect(() => {
    if (waveFormRef.current) {
      const wave = WaveSurfer.create({
        container: waveFormRef.current,
        waveColor: "#ccc",
        progressColor: "#4a9eff",
        cursorColor: "#7ae3c3",
        height: 30,
        barWidth: 2,
        responsive: true,
      });

      wave.on("finish", () => setIsPlaying(false));
      setWaveform(wave);

      return () => {
        wave.destroy();
        if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
        }
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, []);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        setAudioBlob(audioBlob);
        const audioURL = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioURL);
        setIsRecording(false);

        if (waveform) {
          waveform.load(audioURL);
        }

        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      clearInterval(timerRef.current);
    }
  };

  const handlePlayRecording = () => {
    if (waveform) {
      waveform.playPause();
      setIsPlaying(!isPlaying);
    }
  };

  const handlePauseRecording = () => {
    if (waveform) {
      waveform.pause();
      setIsPlaying(false);
    }
  };

  const sendRecording = async () => {
    try {
      if (!audioBlob || !userInfo?.id || !currentChatUser?.id) {
        console.error("Missing required data for sending recording");
        return;
      }

      const formData = new FormData();
      formData.append("audio", audioBlob, "audio_recording.webm");
      formData.append("from", userInfo.id);
      formData.append("to", currentChatUser.id);

      const response = await axios.post(ADD_AUDIO_MESSAGE_ROUTE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.message) {
        socket.current.emit("send-msg", {
          to: currentChatUser?.id,
          from: userInfo?.id,
          message: response.data.message,
          type: "audio",
        });

        dispatch({
          type: "ADD_MESSAGE",
          newMessage: response.data.message,
        });
        
        hide(false); // Close the audio recorder
      }
    } catch (error) {
      console.error("Error sending recording:", error);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex text-2xl w-full items-center justify-end">
      <div className="pt-0 mr-2">
        <FaTrash
          className="text-panel-header-icon cursor-pointer"
          onClick={() => hide(false)}
        />
      </div>
      <div className="mx-4 py-2 px-4 text-white justify-center items-center text-lg flex gap-3 bg-search-input-container-background rounded-full drop-shadow-lg">
        {isRecording ? (
          <div className="text-red-500 animate-pulse w-60 text-center">
            Recording <span>{formatTime(recordingDuration)}</span>
          </div>
        ) : (
          recordedAudio && (
            <>
              {!isPlaying ? (
                <FaPlay 
                  className="cursor-pointer"
                  onClick={handlePlayRecording} 
                />
              ) : (
                <FaStop 
                  className="cursor-pointer"
                  onClick={handlePauseRecording} 
                />
              )}
            </>
          )
        )}

        <div className="w-60" ref={waveFormRef} hidden={isRecording} />
        {recordedAudio && <span>{formatTime(recordingDuration)}</span>}

        <audio ref={audioRef} hidden />
        
        <div className="mr-4">
          {!isRecording ? (
            <FaMicrophone
              className="text-red-500 cursor-pointer"
              onClick={handleStartRecording}
            />
          ) : (
            <FaPauseCircle
              className="text-red-500 cursor-pointer"
              onClick={handleStopRecording}
            />
          )}
        </div>
        
        {recordedAudio && (
          <div>
            <MdSend
              className="text-panel-header-icon cursor-pointer mr-4"
              title="Send Recording"
              onClick={sendRecording}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default CaptureAudio;
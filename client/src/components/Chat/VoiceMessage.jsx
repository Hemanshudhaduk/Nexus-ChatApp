import { useState, useRef, useEffect } from "react";
import { FaMicrophone, FaStop, FaPlay, FaPause, FaTrash } from "react-icons/fa";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/StateReducers";
// import { reducerCases } fr?om "@/context/reducer";

const VoiceMessage = ({ message, onAudioRecorded }) => {
  const [{ messages }, dispatch] = useStateProvider();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  const [audioURL, setAudioURL] = useState(message?.audio || null);

  useEffect(() => {
    if (message?.audio) {
      setAudioURL(message.audio);
    }
  }, [message]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        onAudioRecorded && onAudioRecorded(audioBlob);

        // Dispatch ADD_MESSAGE to update the messages array
        dispatch({
          type: reducerCases.ADD_MESSAGE,
          newMessage: {
            id: message.id,
            audio: audioBlob,
            sender: message.sender,
            receiver: message.receiver,
            type: "audio",
          },
        });
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      audioRef.current.onended = () => setIsPlaying(false);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const deleteAudio = () => {
    setAudioURL(null);
    setIsPlaying(false);

    // Dispatch SET_MESSAGES to remove the audio message
    const updatedMessages = messages.filter((msg) => msg.id !== message.id);
    dispatch({ type: reducerCases.SET_MESSAGES, messages: updatedMessages });
  };

  return (
    <div className="voice-message-container">
      {!audioURL ? (
        isRecording ? (
          <button className="btn stop" onClick={stopRecording}>
            <FaStop /> Stop
          </button>
        ) : (
          <button className="btn record" onClick={startRecording}>
            <FaMicrophone /> Record
          </button>
        )
      ) : (
        <div className="audio-controls">
          {isPlaying ? (
            <button className="btn pause" onClick={pauseAudio}>
              <FaPause /> Pause
            </button>
          ) : (
            <button className="btn play" onClick={playAudio}>
              <FaPlay /> Play
            </button>
          )}
          <button className="btn delete" onClick={deleteAudio}>
            <FaTrash /> Delete
          </button>
          <audio ref={audioRef} src={audioURL} controls hidden></audio>
        </div>
      )}
    </div>
  );
};

export default VoiceMessage;

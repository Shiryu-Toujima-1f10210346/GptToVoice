import React from "react";
import { OpenAIApi, Configuration } from "openai";
import fs from "fs";
function index() {
  const formData = new FormData();
  const endPoint = "https://api.openai.com/v1/audio/transcriptions";
  formData.append("model", "whisper-1");
  formData.append("language", "ja");
  const [history, setHistory] = React.useState([]);
  const [text, setText] = React.useState("");
  const [audioSrc, setAudioSrc] = React.useState("");
  const [userInput, setUserInput] = React.useState("");
  const [recording, setRecording] = React.useState(false);
  const [audioChunks, setAudioChunks] = React.useState([]);
  const [transcription, setTranscription] = React.useState("");

  async function genConversation(input: string) {
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user: input }),
      });
      const data = await response.json();
      console.log(data);
      console.log(data.result);
      console.log(data.result.content);
      setText(data.result.content);
      setHistory([...history, data.result.content]);
      generateVoice(data.result.content);
    } catch (e) {
      console.log(e);
    }
  }

  async function generateVoice(userText: string) {
    console.log(process.env.VOICE_KEY);
    try {
      const response = await fetch(
        `https://deprecatedapis.tts.quest/v2/voicevox/audio/?text=${userText}&key=${process.env.VOICE_KEY}&speaker=1`
      );

      console.log("fetch");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.addEventListener("ended", () => {
        window.URL.revokeObjectURL(url);
      });

      // audioタグのソースを設定
      setAudioSrc(url);
    } catch (e) {
      console.log(e);
    }
  }
  let mediaRecorder: MediaRecorder | null = null;
  const startRecording = () => {
    setRecording(true);
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(async (stream) => {
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: "audio/webm",
        });
        const audioChunks = [];
        mediaRecorder.addEventListener("dataavailable", (event) => {
          audioChunks.push(event.data);
        });
        mediaRecorder.addEventListener("stop", async () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          formData.append("file", audioBlob, "audio.webm");
          console.log(process.env.NEXT_PUBLIC_NOT_INIAD_KEY);
          const trans = fetch(endPoint, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_NOT_INIAD_KEY}`,
            },
            body: formData,
          });
          console.log(trans);
          const response = await (await trans).json();
          console.log(response);
          console.log(response.text);
          setHistory([...history, response.text]);
          setTranscription(response.text);
          setUserInput(response.text);
          genConversation(response.text);
        });
        mediaRecorder.start();
        setTimeout(() => {
          mediaRecorder.stop();
        }, 3000);
      });
  };

  const stopRecording = () => {
    mediaRecorder.stop();
    setRecording(false);
  };

  return (
    <div>
      <div>{userInput}</div>
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
      />
      <button onClick={(e) => genConversation(userInput)}>会話生成</button>
      <div>{text}</div>
      {audioSrc && <audio src={audioSrc} controls autoPlay />}
      <div>
        <button onClick={startRecording} disabled={recording}>
          Record
        </button>
        <button onClick={stopRecording} disabled={!recording}>
          Stop
        </button>
        <p>{history}</p>
      </div>
    </div>
  );
}

export default index;

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
  async function startRecording(file) {
    formData.append("file", file, "audio.webm");
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
  }
  const stopRecording = () => {
    setRecording(false);
  };

  return (
    <div>
      <div>{userInput}</div>

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

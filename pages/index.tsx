import React from "react";

function index() {
  const [text, setText] = React.useState("");
  const [audioSrc, setAudioSrc] = React.useState("");
  const [userInput, setUserInput] = React.useState("あなたの名前は？");

  async function genConversation() {
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user: userInput }),
      });
      const data = await response.json();
      console.log(data);
      console.log(data.result);
      console.log(data.result.content);
      setText(data.result.content);
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
  return (
    <div>
      <div>{userInput}</div>
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
      />
      <button onClick={genConversation}>会話生成</button>
      <div>{text}</div>
      {audioSrc && <audio src={audioSrc} controls autoPlay />}
    </div>
  );
}

export default index;

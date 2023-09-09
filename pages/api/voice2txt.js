const { Configuration, OpenAIApi } = require("openai");
const fs = require("fs");
const configuration = new Configuration({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function main(file) {
  const resp = await openai.createTranscription(
    fs.createReadStream(file),
    "whisper-1",
    undefined,
    "text"
  );
  console.log(resp.data);
  return resp.data;
}

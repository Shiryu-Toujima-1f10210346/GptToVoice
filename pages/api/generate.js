import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  basePath: "https://api.openai.iniad.org/api/v1",
});
const openai = new OpenAIApi(configuration);
const systemText =
  // messagesHistory => systemText
  {
    role: "system",
    content: `
    日本語で返答してください。
    語尾は｢なのだ｣｢のだ｣を使ってください｡
    あなたの名前は｢ずんだもん｣です｡
    なるべく短文で返答してください｡
    一人称は｢ぼく｣です｡
`,
  };

const userMessageHistory = [];
export default async function (req, res) {
  let resText = "";
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message:
          "OpenAI API key not configured, please follow instructions in README.md",
      },
    });
    return;
  }

  const user = req.body.user || "";
  if (user.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a message.",
      },
    });
    return;
  }

  try {
    userMessageHistory.push(user);
    const completion = await openai.createChatCompletion({
      // model: "gpt-4",
      model: "gpt-3.5-turbo",
      messages: [systemText, { role: "user", content: `${user}` }],
      temperature: 0,
    });
    console.log(completion.data.choices[0].message.content);
    console.log([systemText, { role: "user", content: `${user}` }]);
    resText = completion.data.choices[0].message.content;
    res.status(200).json({ result: completion.data.choices[0].message });
    return resText;
  } catch (error) {
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
}

import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const LINE_TOKEN = process.env.LINE_TOKEN;
const OPENAI_KEY = process.env.OPENAI_KEY;

app.post("/webhook", async (req, res) => {
  const events = req.body.events;

  for (const event of events) {
    if (event.type === "message") {
      const userMessage = event.message.text;

      const aiResponse = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-5.3",
          messages: [{ role: "user", content: userMessage }],
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_KEY}`,
          },
        }
      );

      const replyText = aiResponse.data.choices[0].message.content;

      await axios.post(
        "https://api.line.me/v2/bot/message/reply",
        {
          replyToken: event.replyToken,
          messages: [{ type: "text", text: replyText }],
        },
        {
          headers: {
            Authorization: `Bearer ${LINE_TOKEN}`,
          },
        }
      );
    }
  }

  res.sendStatus(200);
});

app.listen(3000);

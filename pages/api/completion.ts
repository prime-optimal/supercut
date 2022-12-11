import { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const completion = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { temperature, prompt, max_tokens } = req.body;

    const { data } = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: temperature,
      max_tokens: max_tokens,
    });

    res.send(data);
  } catch (error) {
    console.log("error", error);

    res.status(500).send(error);
  }
};
export default completion;

import { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const completion = async ({
  temperature = 0.7,
  prompt,
  max_tokens = 256,
}: {
  temperature?: number;
  prompt: string;
  max_tokens?: number;
}) => {
  try {
    const { data } = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: temperature,
      max_tokens: max_tokens,
    });

    return data;
  } catch (error) {
    console.log("error", error);

    throw error;
  }
};
export default completion;

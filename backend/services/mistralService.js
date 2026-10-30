
import client from "../config/mistral.js";

const MODEL =
  process.env.MISTRAL_MODEL || "mistral-small-latest";

export const generateMistralResponse = async (prompt) => {
  try {
    const response = await client.chat.complete({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant that helps students with their queries."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error(
      "Error generating Mistral response:",
      error.message
    );

    throw error;
  }
};

import axios from "axios";
import "dotenv/config";

// This example uses OpenAI, but you can substitute with any AI service
async function generateSummary(text) {
  try {
    // Truncate text if too long (based on token limits of your AI service)
    const truncatedText =
      text.length > 15000 ? text.substring(0, 15000) + "..." : text;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that summarizes documents concisely.",
          },
          {
            role: "user",
            content: `Please provide a comprehensive summary of the following document: ${truncatedText}`,
          },
        ],
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling AI service:", error);
    throw new Error("Failed to generate summary");
  }
}

export { generateSummary };

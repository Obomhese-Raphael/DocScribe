import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

/**
 * Summarizes text using Groq API (Llama 3.3 70b model)
 * @param {string} text - The text to summarize
 * @returns {Promise<string>} - The summarized text
 */
export const summarizeText = async (text) => {
  try {
    if (!text || text.trim() === "") {
      return "No text provided for summarization.";
    }

    if (!process.env.GROQ_API_KEY) {
      throw new Error("Missing GROQ_API_KEY in environment variables");
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile", // ✅ Valid Groq model
          messages: [
            {
              role: "system",
              content:
                "You are a world-class summarizer. Your job is to produce a concise, coherent summary of the provided text. " +
                "Do NOT copy sentences verbatim — rewrite in your own clear words. " +
                "Preserve the original meaning and key insights. " +
                "Output only the summary — no preamble, no commentary, no 'here is a summary'.",
            },
            {
              role: "user",
              content: `Summarize the following text in 6–10 sentences, covering all main points, key insights, supporting details, and conclusions:\n\n${text}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 1000,
          top_p: 0.9,
        }),
      },
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(
        `Groq API error: ${err.error?.message || response.statusText}`,
      );
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content?.trim();

    if (!summary) {
      throw new Error("No summary content returned from Groq");
    }

    console.log("Groq summary generated successfully");
    return summary;
  } catch (error) {
    console.error("Groq summarization error:", error.message);
    return createFallbackSummary(text);
  }
};

/**
 * Creates a simple extractive summary when API fails
 * @param {string} text - The text to summarize
 * @returns {string} - A basic extractive summary
 */
const createFallbackSummary = (text) => {
  try {
    if (!text || text.trim() === "") {
      return "No content available to summarize.";
    }

    const cleanText = text.replace(/\s+/g, " ").trim();
    const sentences = cleanText
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20);

    if (sentences.length === 0) {
      return "Document content is too short to generate a meaningful summary.";
    }

    let summary = "";
    if (sentences.length <= 3) {
      summary = sentences.join(". ") + ".";
    } else {
      const firstPart = sentences.slice(0, 2).join(". ");
      const lastSentence = sentences[sentences.length - 1];
      summary = `${firstPart}. ... ${lastSentence}.`;
    }

    if (summary.length > 500) {
      summary = summary.substring(0, 500) + "...";
    }

    return summary;
  } catch (error) {
    console.error("Fallback summary error:", error);
    return "Unable to generate summary at this time.";
  }
};

/**
 * Handles very long texts by chunking
 * @param {string} text - The full text
 * @returns {Promise<string>} - Combined summary
 */
export const summarizeLongText = async (text) => {
  try {
    if (text.length <= 150000) {
      return await summarizeText(text);
    }

    console.log("Text is extremely long — chunking for safety");

    const maxChunk = 40000;
    const chunks = [];
    let start = 0;

    while (start < text.length) {
      let end = Math.min(start + maxChunk, text.length);
      if (end < text.length) {
        const paraBreak = text.lastIndexOf("\n\n", end);
        const lineBreak = text.lastIndexOf("\n", end);
        if (paraBreak > start) end = paraBreak;
        else if (lineBreak > start) end = lineBreak;
      }
      chunks.push(text.slice(start, end));
      start = end;
    }

    const chunkSummaries = [];
    for (const chunk of chunks) {
      try {
        const chunkSummary = await summarizeText(chunk);
        if (chunkSummary && chunkSummary.trim()) {
          chunkSummaries.push(chunkSummary);
        }
        await new Promise((r) => setTimeout(r, 1500));
      } catch (err) {
        console.error("Chunk summarization failed:", err);
      }
    }

    if (chunkSummaries.length === 0) {
      return createFallbackSummary(text);
    }

    const combined = chunkSummaries.join("\n\n");

    return await summarizeText(
      `Combine and condense these summaries into one concise overall summary (3–5 sentences):\n\n${combined}`,
    );
  } catch (error) {
    console.error("Long text summarization error:", error);
    return createFallbackSummary(text);
  }
};

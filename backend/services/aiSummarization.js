import dotenv from "dotenv";
import fetch from "node-fetch";

// Load environment variables
dotenv.config();

/**
 * Summarizes text using the Hugging Face API (BART-large-CNN model)
 * @param {string} text - The text to summarize
 * @param {Object} options - Configuration options for summarization
 * @param {number} options.maxLength - Maximum length of the summary (default: 400)
 * @param {number} options.minLength - Minimum length of the summary (default: 100)
 * @param {boolean} options.doSample - Whether to use sampling (default: true)
 * @param {number} options.numBeams - Number of beams for beam search (default: 4)
 * @param {number} options.temperature - Temperature for sampling (default: 1.0)
 * @param {number} options.topK - Top-k sampling (default: 50)
 * @param {number} options.topP - Top-p sampling (default: 0.95)
 * @param {number} options.repetitionPenalty - Repetition penalty (default: 1.0)
 * @param {number} options.lengthPenalty - Length penalty (default: 1.0)
 * @param {boolean} options.noRepeatNgramSize - Size of n-grams to avoid repeating (default: 3)
 * @returns {Promise<string>} - The summarized text
 */
export const summarizeText = async (text, options = {}) => {
  try {
    // Check if text is provided and not empty
    if (!text || text.trim() === "") {
      throw new Error("No text provided for summarization");
    }

    console.log("Starting text summarization...");

    // Check if API key is available - FIXED THE LOGIC HERE
    if (!process.env.HUGGINGFACE_API_KEY) {
      console.error("Missing HUGGINGFACE_API_KEY environment variable");
      throw new Error("API key not configured");
    }

    console.log("HUGGINGFACE_API_KEY environment variable available");

    // Default options for longer, more detailed summaries
    const defaultOptions = {
      maxLength: 400,
      minLength: 200,
      doSample: true,
      numBeams: 4,
      temperature: 1.0,
      topK: 50,
      topP: 0.95,
      repetitionPenalty: 1.2,
      lengthPenalty: 1.0,
      noRepeatNgramSize: 3,
    };

    // Merge default options with provided options
    const summarizationOptions = { ...defaultOptions, ...options };

    // Truncate text if it's too long (BART model has input limits)
    const truncatedText = text.slice(0, 4000);

    console.log("Sending request to Hugging Face API...");
    console.log("Text length:", truncatedText.length);

    const response = await fetch(
      // "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: truncatedText,
          parameters: {
            max_length: summarizationOptions.maxLength,
            min_length: summarizationOptions.minLength,
            do_sample: summarizationOptions.doSample,
            num_beams: summarizationOptions.numBeams,
            temperature: summarizationOptions.temperature,
            top_k: summarizationOptions.topK,
            top_p: summarizationOptions.topP,
            repetition_penalty: summarizationOptions.repetitionPenalty,
            length_penalty: summarizationOptions.lengthPenalty,
            no_repeat_ngram_size: summarizationOptions.noRepeatNgramSize,
          },
          options: {
            wait_for_model: true,
            use_cache: true,
          },
        }),
      }
    );

    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error response:", errorText);
      console.error("Response status:", response.status);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }

      // If model is loading, try fallback
      if (
        errorData.error &&
        (errorData.error.includes("loading") ||
          errorData.error.includes("currently loading"))
      ) {
        console.log("Model is loading, attempting fallback summary...");
        return createFallbackSummary(text);
      }

      // If rate limited, try fallback
      if (response.status === 429) {
        console.log("Rate limited, attempting fallback summary...");
        return createFallbackSummary(text);
      }

      throw new Error(`API request failed: ${errorData.error || errorText}`);
    }

    const result = await response.json();
    console.log("Response from Hugging Face API:", result);

    // Extract the summary from the response
    if (Array.isArray(result) && result.length > 0 && result[0].summary_text) {
      console.log("Successfully generated summary");
      return result[0].summary_text;
    } else if (result && result.summary_text) {
      console.log("Successfully generated summary (alternative format)");
      return result.summary_text;
    } else {
      console.error("Unexpected API response format:", result);

      // If API returns unexpected format, create fallback
      console.log("Creating fallback summary due to unexpected response...");
      return createFallbackSummary(text);
    }
  } catch (error) {
    console.error("Error in summarizeText:", error);

    // Instead of returning undefined, create a fallback summary
    console.log("Creating fallback summary due to error...");
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

    // Clean the text
    const cleanText = text.replace(/\s+/g, " ").trim();

    // Split into sentences
    const sentences = cleanText
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20); // Filter out very short sentences

    if (sentences.length === 0) {
      return "Document content is too short to generate a meaningful summary.";
    }

    // Take first few sentences and last sentence for a basic summary
    let summary = "";

    if (sentences.length <= 3) {
      summary = sentences.join(". ") + ".";
    } else {
      // Take first 2 sentences and last sentence
      const firstPart = sentences.slice(0, 2).join(". ");
      const lastSentence = sentences[sentences.length - 1];
      summary = `${firstPart}. ... ${lastSentence}.`;
    }

    // Ensure summary isn't too long
    if (summary.length > 500) {
      summary = summary.substring(0, 500) + "...";
    }

    return `[Auto-generated summary] ${summary}`;
  } catch (error) {
    console.error("Error creating fallback summary:", error);
    return "Unable to generate summary at this time.";
  }
};

// Handle longer texts by splitting and rejoining
export const summarizeLongText = async (text, options = {}) => {
  try {
    if (!text || text.trim() === "") {
      throw new Error("No text provided for summarization");
    }

    const maxLength = 4000;

    if (text.length <= maxLength) {
      return await summarizeText(text, options);
    }

    console.log("Processing long text - splitting into chunks...");

    // Split text into chunks
    const chunks = [];
    let startIndex = 0;

    while (startIndex < text.length) {
      let endIndex = Math.min(startIndex + maxLength, text.length);

      // Try to find a good break point
      if (endIndex < text.length) {
        const paragraphBreak = text.lastIndexOf("\n\n", endIndex);
        const singleBreak = text.lastIndexOf("\n", endIndex);
        const sentenceBreak = text.lastIndexOf(".", endIndex);

        if (paragraphBreak > startIndex && paragraphBreak > endIndex - 500) {
          endIndex = paragraphBreak;
        } else if (singleBreak > startIndex && singleBreak > endIndex - 200) {
          endIndex = singleBreak;
        } else if (
          sentenceBreak > startIndex &&
          sentenceBreak > endIndex - 100
        ) {
          endIndex = sentenceBreak + 1;
        }
      }

      chunks.push(text.slice(startIndex, endIndex));
      startIndex = endIndex;
    }

    console.log(`Split text into ${chunks.length} chunks for summarization`);

    // Options for individual chunk summaries
    const chunkOptions = {
      ...options,
      maxLength: Math.min(250, options.maxLength || 250),
      minLength: Math.min(50, options.minLength || 50),
    };

    // Summarize each chunk with error handling
    const chunkSummaries = [];
    for (let i = 0; i < chunks.length; i++) {
      try {
        console.log(`Processing chunk ${i + 1}/${chunks.length}...`);
        const summary = await summarizeText(chunks[i], chunkOptions);
        if (summary && summary.trim()) {
          chunkSummaries.push(summary);
        }

        // Add small delay between requests to avoid rate limiting
        if (i < chunks.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Increased delay
        }
      } catch (error) {
        console.error(`Error summarizing chunk ${i + 1}:`, error);
        // Continue with other chunks even if one fails
      }
    }

    if (chunkSummaries.length === 0) {
      console.log(
        "No chunks were successfully summarized, creating fallback..."
      );
      return createFallbackSummary(text);
    }

    // Join the summaries
    const combinedSummary = chunkSummaries.join(" ");

    // If the combined summary is still too long, summarize it again
    if (combinedSummary.length > maxLength) {
      console.log("Combined summary too long, creating final summary...");
      try {
        return await summarizeText(combinedSummary, options);
      } catch (error) {
        console.error("Error summarizing combined text:", error);
        // Return the combined summary even if final summarization fails
        return combinedSummary;
      }
    }

    return combinedSummary;
  } catch (error) {
    console.error("Error in summarizeLongText:", error);
    return createFallbackSummary(text);
  }
};

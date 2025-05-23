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

    console.log("HUGGINGFACE_API_KEY: ", process.env.HUGGINGFACE_API_KEY);

    // Check if API key is available
    if (!process.env.HUGGINGFACE_API_KEY) {
      console.error("Missing HUGGINGFACE_API_KEY environment variable");
    }

    // Default options for longer, more detailed summaries
    const defaultOptions = {
      maxLength: 400, // Longer summary (about 3-4 paragraphs)
      minLength: 100, // Ensure a substantial summary
      doSample: true, // Enable sampling for more diverse text
      numBeams: 4, // Beam search for better quality
      temperature: 1.0, // Standard temperature (higher = more creative)
      topK: 50, // Standard top-k sampling
      topP: 0.95, // Standard nucleus sampling
      repetitionPenalty: 1.2, // Slightly penalize repetition
      lengthPenalty: 1.0, // Standard length penalty
      noRepeatNgramSize: 3, // Avoid repeating trigrams
    };

    // Merge default options with provided options
    const summarizationOptions = { ...defaultOptions, ...options };

    // Truncate text if it's too long (BART model has input limits)
    // Generally, BART-large-CNN works best with text under 1024 tokens
    const truncatedText = text.slice(0, 4000);

    console.log(
      "Sending request to Hugging Face API with options:",
      summarizationOptions
    );

    const response = await fetch(
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
            wait_for_model: true, // Wait if the model is currently loading
            use_cache: true, // Use cached results if available
          },
        }),
      }
    );

    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error response:", errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }

      // If the API fails, fall back to basic summarization
      console.log("API FAILED");
    }

    const result = await response.json();
    console.log("Response from Hugging Face API:", result);

    // Extract the summary from the response
    // The response format should be an array with objects containing the summary_text field
    if (Array.isArray(result) && result.length > 0 && result[0].summary_text) {
      return result[0].summary_text;
    } else if (result && result.summary_text) {
      // Handle alternative response format
      return result.summary_text;
    } else {
      console.error("Unexpected API response format:", result);
    }
  } catch (error) {
    console.error("Error in summarizeText:", error);
  }
};

// Handle longer texts by splitting and rejoining
export const summarizeLongText = async (text, options = {}) => {
  // For very long texts, we might want to split it into chunks,
  // summarize each chunk, and then summarize the combined summaries
  try {
    if (!text || text.trim() === "") {
      throw new Error("No text provided for summarization");
    }

    const maxLength = 4000; // Max chunk size for API processing

    if (text.length <= maxLength) {
      return await summarizeText(text, options);
    }

    // Split text into chunks of roughly equal size, trying to split at paragraph breaks
    const chunks = [];
    let startIndex = 0;

    while (startIndex < text.length) {
      let endIndex = Math.min(startIndex + maxLength, text.length);

      // Try to find a paragraph break near the end of the chunk
      if (endIndex < text.length) {
        const paragraphBreak = text.lastIndexOf("\n\n", endIndex);
        const singleBreak = text.lastIndexOf("\n", endIndex);

        // If we found a good break point within reasonable distance, use it
        if (paragraphBreak > startIndex && paragraphBreak > endIndex - 500) {
          endIndex = paragraphBreak;
        } else if (singleBreak > startIndex && singleBreak > endIndex - 200) {
          endIndex = singleBreak;
        }
      }

      chunks.push(text.slice(startIndex, endIndex));
      startIndex = endIndex;
    }

    console.log(`Split text into ${chunks.length} chunks for summarization`);

    // Options for individual chunk summaries - somewhat shorter than final summary
    const chunkOptions = {
      ...options,
      maxLength: Math.min(250, options.maxLength || 250),
      minLength: Math.min(50, options.minLength || 50),
    };

    // Summarize each chunk
    const chunkSummaries = await Promise.all(
      chunks.map(async (chunk) => {
        try {
          return await summarizeText(chunk, chunkOptions);
        } catch (error) {
          console.error("Error summarizing chunk:", error);
        }
      })
    );

    // Join the summaries
    const combinedSummary = chunkSummaries.join("\n\n");

    // If the combined summary is still too long, summarize it again
    if (combinedSummary.length > maxLength) {
      // Options for the final summary - use the original requested options
      try {
        return await summarizeText(combinedSummary, options);
      } catch (error) {
        console.error("Error summarizing combined text:", error);
      }
    }

    return combinedSummary;
  } catch (error) {
    console.error("Error in summarizeLongText:", error);
  }
};
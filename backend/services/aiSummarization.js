import dotenv from "dotenv";
import fetch from "node-fetch";

// Load environment variables
dotenv.config();

/**
 * Summarizes text using the Hugging Face API (BART-large-CNN model)
 * @param {string} text - The text to summarize
 * @returns {Promise<string>} - The summarized text
 */
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
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
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
      throw new Error(`Hugging Face API error: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log("Response from Hugging Face API:", result);

    // Extract the summary from the response
    // The response format should be an array with objects containing the summary_text field
    if (Array.isArray(result) && result.length > 0 && result[0].summary_text) {
      return result[0].summary_text;
    } else {
      console.error("Unexpected API response format:", result);
      throw new Error("Unexpected response format from summarization API");
    }
  } catch (error) {
    console.error("Error in summarizeText:", error);
    throw error;
  }
};

/**
 * Alternative implementation using the query parameter format
 * @param {string} text - The text to summarize
 * @returns {Promise<string>} - The summarized text
 */
export const summarizeTextAlternative = async (text) => {
  try {
    // Check if text is provided and not empty
    if (!text || text.trim() === "") {
      throw new Error("No text provided for summarization");
    }

    // Truncate text if it's too long (BART model has input limits)
    const truncatedText = text.slice(0, 4000);

    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: truncatedText,
          options: {
            wait_for_model: true, // Wait if the model is currently loading
            use_cache: true, // Use cached results if available
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      throw new Error(`Hugging Face API error: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();

    if (Array.isArray(result) && result.length > 0 && result[0].summary_text) {
      return result[0].summary_text;
    } else {
      throw new Error("Failed to extract summary from API response");
    }
  } catch (error) {
    console.error("Error in summarizeTextAlternative:", error);
    throw error;
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
          // Return a minimal summary for failed chunks to avoid breaking the whole process
          return "Content summarization failed for this section.";
        }
      })
    );

    // Join the summaries
    const combinedSummary = chunkSummaries.join("\n\n");

    // If the combined summary is still too long, summarize it again
    if (combinedSummary.length > maxLength) {
      // Options for the final summary - use the original requested options
      return await summarizeText(combinedSummary, options);
    }

    return combinedSummary;
  } catch (error) {
    console.error("Error in summarizeLongText:", error);
    throw error;
  }
};

/**
 * Fallback summarization function that uses a basic extractive method
 * when the API is unavailable
 * @param {string} text - The text to summarize
 * @returns {string} - A basic summary
 */
export const fallbackSummarize = (text) => {
  if (!text || text.trim() === "") {
    return "No content available to summarize.";
  }

  // Split into sentences (basic approach)
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];

  // If very short text, just return it
  if (sentences.length <= 3) {
    return text;
  }

  // Take the first sentence (usually contains the main point)
  let summary = sentences[0].trim();

  // Add a sentence from the middle
  const middleIndex = Math.floor(sentences.length / 2);
  summary += " " + sentences[middleIndex].trim();

  // Add the last sentence (often contains a conclusion)
  if (sentences.length > 2) {
    summary += " " + sentences[sentences.length - 1].trim();
  }

  // If summary is still very short, add more sentences
  if (summary.length < 100 && sentences.length > 3) {
    summary += " " + sentences[1].trim();
  }

  return summary;
};

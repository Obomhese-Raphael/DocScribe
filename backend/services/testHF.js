// Test script for Hugging Face API
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

async function testHuggingFaceAPI() {
  console.log("🧪 Testing Hugging Face API Connection...");

  // Check if API key exists
  if (!process.env.HUGGINGFACE_API_KEY) {
    console.error("❌ HUGGINGFACE_API_KEY not found in environment variables");
    return;
  }

  console.log("✅ API Key found");
  console.log(
    "🔑 API Key preview:",
    process.env.HUGGINGFACE_API_KEY.substring(0, 10) + "..."
  );

  const testText =
    "The tower is 324 metres (1,063 ft) tall, about the same height as an 81-storey building, and the tallest structure in Paris. Its base is square, measuring 125 metres (410 ft) on each side.";

  try {
    console.log("📤 Sending test request...");

    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: testText,
          parameters: {
            max_length: 100,
            min_length: 30,
            do_sample: false,
          },
        }),
      }
    );

    console.log("📥 Response status:", response.status);
    console.log("📥 Response headers:", Object.fromEntries(response.headers));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error:", errorText);

      try {
        const errorJson = JSON.parse(errorText);
        console.error("❌ Parsed error:", errorJson);
      } catch (e) {
        console.error("❌ Raw error text:", errorText);
      }
      return;
    }

    const result = await response.json();
    console.log("✅ Success! API Response:", result);

    if (Array.isArray(result) && result.length > 0 && result[0].summary_text) {
      console.log("✅ Summary generated:", result[0].summary_text);
    } else {
      console.log("⚠️ Unexpected response structure:", result);
    }
  } catch (error) {
    console.error("❌ Network/Request Error:", error.message);
    console.error("❌ Full error:", error);
  }
}

// Run the test
testHuggingFaceAPI();

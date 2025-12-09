const express = require("express");
const router = express.Router();
const axios = require("axios");
const authenticateToken = require("../middleware/authMiddleware");


router.post("/recognize-product", authenticateToken, async (req, res) => {
  try {
    const { imageUrl, imageBase64 } = req.body;

    if (!imageUrl && !imageBase64) {
      return res.status(400).json({ error: "Image URL or base64 image is required" });
    }

    const visionApiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`;

    // Подготовка объекта изображения
    let imageObject;
    if (imageBase64) {
      // Удаляем префикс data:image/...;base64, если он есть
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      imageObject = {
        content: base64Data
      };
    } else {
      imageObject = {
        source: {
          imageUri: imageUrl,
        },
      };
    }

    const response = await axios.post(visionApiUrl, {
      requests: [
        {
          image: imageObject,
          features: [
            {
              type: "LABEL_DETECTION",
              maxResults: 10,
            },
            {
              type: "WEB_DETECTION",
              maxResults: 5,
            },
          ],
        },
      ],
    });

    const labels = response.data.responses[0]?.labelAnnotations || [];
    const webDetection = response.data.responses[0]?.webDetection || {};

    res.json({
      labels: labels.map((label) => ({
        description: label.description,
        score: label.score,
      })),
      webEntities: webDetection.webEntities || [],
      bestGuessLabels: webDetection.bestGuessLabels || [],
    });
  } catch (error) {
    console.error("Error recognizing image:", error.response?.data || error.message);
    res.status(500).json({
      error: "Error recognizing image",
      details: error.response?.data || error.message,
    });
  }
});


router.post("/recipe-recommendations", authenticateToken, async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Product list is required" });
    }

    const prompt = `Using the following products: ${products.join(", ")}. 
    Suggest 3 simple recipes that can be made. 
    For each recipe, provide: title, cooking time, difficulty (easy/medium/hard), a brief description, and main steps.
    The response should be in the JSON format of an array of objects with fields: title, time, difficulty, description, steps (array of strings).`;

    let recommendations;
    const aiProvider = process.env.AI_PROVIDER || "groq"; // groq, huggingface, cohere, openai

    try {
      switch (aiProvider.toLowerCase()) {
        case "groq":
          // Groq API - быстрый и бесплатный
          const groqResponse = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              model: "llama-3.1-8b-instant", // или "mixtral-8x7b-32768"
              messages: [
                {
                  role: "system",
                  content: "You are a helpful culinary assistant who helps create recipes based on available products. Always respond with valid JSON only.",
                },
                {
                  role: "user",
                  content: prompt,
                },
              ],
              temperature: 0.7,
              max_tokens: 1000,
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json",
              },
            }
          );
          recommendations = groqResponse.data.choices[0].message.content;
          break;

        case "huggingface":
          // Hugging Face Inference API - бесплатный
          const hfResponse = await axios.post(
            `https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium`,
            {
              inputs: prompt,
              parameters: {
                max_length: 500,
                return_full_text: false,
              },
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                "Content-Type": "application/json",
              },
            }
          );
          // Hugging Face возвращает другой формат, нужно адаптировать
          recommendations = JSON.stringify([{
            title: "Recipe suggestion",
            time: "30 min",
            difficulty: "easy",
            description: hfResponse.data.generated_text || "Recipe based on your products",
            steps: ["Prepare ingredients", "Cook according to recipe"]
          }]);
          break;

        case "cohere":
          // Cohere API - бесплатный тариф
          const cohereResponse = await axios.post(
            "https://api.cohere.ai/v1/generate",
            {
              model: "command",
              prompt: `You are a culinary assistant. ${prompt}`,
              max_tokens: 1000,
              temperature: 0.7,
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
                "Content-Type": "application/json",
              },
            }
          );
          recommendations = cohereResponse.data.generations[0].text;
          break;

        case "openai":
        default:
          // OpenAI API (оригинальный вариант)
          const openaiResponse = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
              model: "gpt-3.5-turbo",
              messages: [
                {
                  role: "system",
                  content: "You are a helpful culinary assistant who helps create recipes based on available products.",
                },
                {
                  role: "user",
                  content: prompt,
                },
              ],
              temperature: 0.7,
              max_tokens: 1000,
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
              },
            }
          );
          recommendations = openaiResponse.data.choices[0].message.content;
          break;
      }

      let recipes;
      try {
        const jsonMatch = recommendations.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          recipes = JSON.parse(jsonMatch[0]);
        } else {
          recipes = JSON.parse(recommendations);
        }
      } catch (parseError) {
        // Если не удалось распарсить JSON, создаем базовую структуру
        recipes = [{
          title: "Recipe suggestion",
          time: "30 min",
          difficulty: "easy",
          description: recommendations.substring(0, 200),
          steps: recommendations.split("\n").filter(s => s.trim().length > 0).slice(0, 5)
        }];
      }

      res.json({ recipes });
    } catch (apiError) {
      console.error(`Error with ${aiProvider} API:`, apiError.response?.data || apiError.message);
      // Fallback: возвращаем базовые рекомендации
      res.json({
        recipes: [{
          title: "Simple Recipe",
          time: "30 min",
          difficulty: "easy",
          description: `A delicious recipe using ${products.slice(0, 3).join(", ")}`,
          steps: [
            "Prepare all ingredients",
            "Mix ingredients together",
            "Cook for 20-30 minutes",
            "Serve hot"
          ]
        }]
      });
    }
  } catch (error) {
    console.error("Error getting recommendations:", error.response?.data || error.message);
    res.status(500).json({
      error: "Error getting recommendations",
      details: error.response?.data || error.message,
    });
  }
});


router.post("/smart-search", authenticateToken, async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const prompt = `User is searching for products with the query: "${query}". 
    Determine which product categories and keywords best match this query.
    Return the response in JSON format with fields: categories (array of category names), keywords (array of keywords), suggestion (short text suggestion).`;

    const aiProvider = process.env.AI_PROVIDER || "groq";
    let aiResponse;

    try {
      switch (aiProvider.toLowerCase()) {
        case "groq":
          const groqResponse = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              model: "llama-3.1-8b-instant",
              messages: [
                {
                  role: "system",
                  content: "You are an assistant in an online store who helps users find the products they need. Always respond with valid JSON only.",
                },
                {
                  role: "user",
                  content: prompt,
                },
              ],
              temperature: 0.5,
              max_tokens: 300,
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json",
              },
            }
          );
          aiResponse = groqResponse.data.choices[0].message.content;
          break;

        case "openai":
        default:
          const openaiResponse = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
              model: "gpt-3.5-turbo",
              messages: [
                {
                  role: "system",
                  content: "You are an assistant in an online store who helps users find the products they need.",
                },
                {
                  role: "user",
                  content: prompt,
                },
              ],
              temperature: 0.5,
              max_tokens: 300,
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
              },
            }
          );
          aiResponse = openaiResponse.data.choices[0].message.content;
          break;
      }

      let searchSuggestions;
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          searchSuggestions = JSON.parse(jsonMatch[0]);
        } else {
          searchSuggestions = JSON.parse(aiResponse);
        }
      } catch (parseError) {
        searchSuggestions = { 
          suggestion: aiResponse,
          categories: [],
          keywords: query.split(" ")
        };
      }

      res.json(searchSuggestions);
    } catch (apiError) {
      console.error(`Error with ${aiProvider} API:`, apiError.response?.data || apiError.message);
      // Fallback
      res.json({
        suggestion: `Try searching for: ${query}`,
        categories: [],
        keywords: query.split(" ")
      });
    }
  } catch (error) {
    console.error("Error in smart search:", error.response?.data || error.message);
    res.status(500).json({
      error: "Error performing smart search",
      details: error.response?.data || error.message,
    });
  }
});

module.exports = router;
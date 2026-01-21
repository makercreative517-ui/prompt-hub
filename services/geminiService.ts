import { GoogleGenAI, Type } from "@google/genai";
import { AspectRatio, ImageSize } from "../types";

// Helper to get client instance
const getAiClient = () => {
  // Always create a new instance to ensure we capture the latest injected API Key
  // especially after a user selects a key via window.aistudio
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const describeImageForPrompt = async (base64Data: string, mimeType: string): Promise<string> => {
  const ai = getAiClient();
  
  // Using gemini-3-pro-preview for best visual reasoning capability
  // to reverse-engineer the prompt.
  const modelId = "gemini-3-pro-preview";

  const prompt = `
    Analyze this image in extreme detail. 
    Your task is to write a high-quality text prompt that I can feed into the 'Gemini 3 Pro Image' (Nano Banana Pro) generative model to recreate an image very similar to this one.
    
    Focus on:
    1. Subject description (appearance, clothing, pose, expression).
    2. Environment/Setting (background, lighting, atmosphere).
    3. Artistic Style (photorealistic, oil painting, 3D render, anime, etc.).
    4. Technical attributes (camera angles, depth of field, color palette, texture quality).
    
    Output ONLY the prompt text. Do not include introductory or concluding phrases like "Here is the prompt:". Just the raw prompt.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        // Thinking budget can help with complex scene analysis, but default is usually sufficient for description.
        // We'll trust the model's default behavior.
        systemInstruction: "You are an expert prompt engineer for state-of-the-art image generation models.",
      }
    });

    return response.text || "Failed to generate prompt.";
  } catch (error) {
    console.error("Error generating prompt description:", error);
    throw error;
  }
};

export const generateImageFromPrompt = async (
  prompt: string, 
  aspectRatio: AspectRatio = AspectRatio.Square,
  size: ImageSize = ImageSize.OneK
): Promise<string> => {
  const ai = getAiClient();
  // "nano banana pro" corresponds to 'gemini-3-pro-image-preview'
  const modelId = "gemini-3-pro-image-preview";

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: size
        }
      }
    });

    // Extract image from response
    // The response candidates content parts will contain the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) throw new Error("No content generated");

    for (const part of parts) {
      if (part.inlineData) {
        const base64Data = part.inlineData.data;
        const mimeType = part.inlineData.mimeType || "image/png";
        return `data:${mimeType};base64,${base64Data}`;
      }
    }

    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};
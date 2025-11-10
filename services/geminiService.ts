
import { GoogleGenAI, Type } from "@google/genai";
import { CartAnalysisResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might want to handle this more gracefully.
  // For this environment, we assume it's always present.
  console.warn("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

// Helper function to convert a file to a base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove the "data:image/jpeg;base64," part
      resolve(result.split(',')[1]); 
    };
    reader.onerror = (error) => reject(error);
  });
};

export const analyzeCartScreenshot = async (file: File): Promise<CartAnalysisResult> => {
  const base64Data = await fileToBase64(file);

  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: file.type,
    },
  };

  const textPart = {
    text: `Analyze this shopping cart screenshot. Extract the total price (including currency symbol) and list the items. Respond ONLY in JSON format. The JSON object should have two keys: "totalPrice" (a string) and "items" (an array of strings, where each string is an item description). If you cannot find the total price or items, return an empty string or an empty array for the respective fields.`,
  };

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              totalPrice: {
                type: Type.STRING,
                description: 'The total price from the cart, including currency.',
              },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
                description: 'A list of item descriptions from the cart.',
              },
            },
          },
        }
    });

    const jsonString = response.text;
    const result = JSON.parse(jsonString);

    if (typeof result.totalPrice === 'string' && Array.isArray(result.items)) {
        return result as CartAnalysisResult;
    } else {
        console.error("Parsed JSON does not match expected structure:", result);
        throw new Error("Invalid response format from API.");
    }
  } catch (error) {
    console.error("Error analyzing cart screenshot:", error);
    throw new Error("Could not analyze the provided image. Please ensure it's a clear screenshot of your cart.");
  }
};

import { GoogleGenAI, Type } from "@google/genai";
import { PurchaseHistoryItem, ScannedItem } from '../types';

// Get API key with fallbacks and validation
const getApiKey = (): string => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not configured. Please set it in your .env.local file.');
    throw new Error('API key not configured');
  }
  
  return apiKey;
};

let aiInstance: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI => {
  if (!aiInstance) {
    try {
      aiInstance = new GoogleGenAI({ apiKey: getApiKey() });
    } catch (error) {
      console.error('Failed to initialize GoogleGenAI:', error);
      throw error;
    }
  }
  return aiInstance;
};

export const suggestStore = async (itemName: string, itemHistory: PurchaseHistoryItem[]): Promise<string> => {
  try {
    const ai = getAI();
    
    let historyText = "No purchase history available.";
    if (itemHistory.length > 0) {
      // Sort by price to find the cheapest first
      const sortedHistory = [...itemHistory].sort((a, b) => a.price - b.price);
      historyText = "The user has bought this item before:\n" + sortedHistory
        .map(p => `- At ${p.store} for $${p.price.toFixed(2)} on ${new Date(p.date).toLocaleDateString()}`)
        .join("\n");
    }

    const contents = `For the shopping item "${itemName}", suggest the cheapest store in Singapore to buy it from.
First, consider the user's past purchase history provided below to see which store has been cheapest.
Then, search the web for current prices and promotions in Singaporean stores like FairPrice, Cold Storage, Giant, Sheng Siong, etc.
Based on both the history and the web search, provide a single store suggestion and a brief, one-sentence reason for why it's the cheapest option now.

User's Purchase History for "${itemName}":
${historyText}

Your suggestion should be concise. For example: "FairPrice, as it was the cheapest in your history and current promotions confirm it's a good price."`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const result = response.text?.trim();
    
    if (!result) {
      return "No suggestion available at this time.";
    }
    
    return result;
  } catch (error) {
    console.error("Error fetching suggestion from Gemini API:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return "API key not configured. Please check your settings.";
      }
      if (error.message.includes('quota')) {
        return "API quota exceeded. Please try again later.";
      }
      if (error.message.includes('network')) {
        return "Network error. Please check your connection.";
      }
    }
    
    return "Could not get suggestion. Please try again later.";
  }
};

export const extractItemsFromReceipt = async (base64Image: string): Promise<ScannedItem[]> => {
  try {
    const ai = getAI();
    
    // Validate base64 image
    if (!base64Image || !base64Image.includes(',')) {
      throw new Error('Invalid image format. Please try capturing the receipt again.');
    }
    
    const contents = {
      parts: [
        {
          text: `Analyze the provided receipt image. Extract every distinct line item, including its name, quantity, and total price.
          - Ignore any taxes, totals, subtotals, discounts, or non-item lines.
          - If quantity is not explicitly mentioned for an item, assume it is 1.
          - Ensure the price is a number.
          - Return the data as a JSON object.`,
        },
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image.split(',')[1], // Remove the data URI prefix
          },
        },
      ],
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              description: 'A list of items found on the receipt.',
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: 'The name of the purchased item.' },
                  quantity: { type: Type.NUMBER, description: 'The quantity of the item purchased.' },
                  price: { type: Type.NUMBER, description: 'The total price for this line item.' },
                },
                required: ['name', 'quantity', 'price'],
              },
            },
          },
          required: ['items'],
        },
      },
    });

    const jsonText = response.text?.trim();
    
    if (!jsonText) {
      throw new Error('No response from AI. Please try again.');
    }
    
    let result;
    try {
      result = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', jsonText);
      throw new Error('Failed to parse AI response. The receipt might be unclear.');
    }

    if (!result || !Array.isArray(result.items)) {
      throw new Error('Invalid response format. Please try again with a clearer image.');
    }
    
    // Validate and filter items
    const validItems = result.items.filter((item: any) => {
      return item.name && 
             typeof item.name === 'string' && 
             item.name.trim() !== '' &&
             typeof item.price === 'number' && 
             item.price > 0 &&
             typeof item.quantity === 'number' &&
             item.quantity > 0;
    });
    
    if (validItems.length === 0) {
      throw new Error('No valid items found on the receipt. Please try again with a clearer image.');
    }
    
    return validItems;

  } catch (error) {
    console.error("Error extracting items from receipt:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('API key not configured. Please check your settings.');
      }
      if (error.message.includes('quota')) {
        throw new Error('API quota exceeded. Please try again later.');
      }
      // Re-throw our custom error messages
      if (error.message.includes('Invalid') || 
          error.message.includes('No valid') || 
          error.message.includes('Failed to parse')) {
        throw error;
      }
    }
    
    throw new Error('Failed to analyze receipt. The image might be unclear or the format is not supported.');
  }
};

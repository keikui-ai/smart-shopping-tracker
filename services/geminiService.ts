import { GoogleGenAI, Type } from "@google/genai";
import { PurchaseHistoryItem, ScannedItem } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const suggestStore = async (itemName: string, itemHistory: PurchaseHistoryItem[]): Promise<string> => {
  try {
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

    return response.text.trim() || "No suggestion found.";
  } catch (error) {
    console.error("Error fetching suggestion from Gemini API:", error);
    return "Could not get suggestion.";
  }
};

export const extractItemsFromReceipt = async (base64Image: string): Promise<ScannedItem[]> => {
  try {
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

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);

    if (result && Array.isArray(result.items)) {
      return result.items.filter(item => item.name && typeof item.price === 'number'); // Basic validation
    }
    return [];

  } catch (error) {
    console.error("Error extracting items from receipt:", error);
    // Let the caller handle the error display
    throw new Error('Failed to analyze receipt. The image might be unclear or the format is not supported.');
  }
};

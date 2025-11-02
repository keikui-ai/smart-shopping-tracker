export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  suggestedStore?: string;
  category?: string;
  imageUrl?: string; // Base64 encoded image string
}

export interface PurchaseHistoryItem {
  id: string;
  name: string;
  price: number;
  store: string;
  date: string; // ISO date string
  imageUrl?: string; // Base64 encoded image string
}

export interface ScannedItem {
  name: string;
  quantity: number;
  price: number;
}


import { PurchaseHistoryItem } from '../types';

// This is a mock service to simulate fetching data from a Google Sheet.
// In a real-world application, you would use the Google Sheets API here.
// This would require setting up a Google Cloud project, enabling the Sheets API,
// and handling authentication (e.g., OAuth 2.0 or an API key).

const MOCK_DATA: PurchaseHistoryItem[] = [
  { id: '1', name: 'Organic Almond Milk', price: 5.99, store: 'FairPrice', date: '2024-07-20T10:00:00Z' },
  { id: '2', name: 'Avocado', price: 1.50, store: 'Cold Storage', date: '2024-07-19T12:30:00Z' },
  { id: '3', name: 'Sourdough Bread', price: 7.50, store: 'Giant', date: '2024-07-21T09:00:00Z' },
  { id: '4', name: 'Organic Almond Milk', price: 6.20, store: 'Cold Storage', date: '2024-07-12T10:00:00Z' },
  { id: '5', name: 'Free-range Eggs', price: 8.00, store: 'FairPrice', date: '2024-07-21T09:05:00Z' },
  { id: '6', name: 'Laundry Detergent', price: 12.90, store: 'Giant', date: '2024-07-15T18:00:00Z' },
  { id: '7', name: 'Avocado', price: 1.65, store: 'FairPrice', date: '2024-07-22T14:00:00Z' },
  { id: '8', name: 'Greek Yogurt', price: 9.50, store: 'Cold Storage', date: '2024-07-19T12:35:00Z' },
  { id: '9', name: 'Dish Soap', price: 4.50, store: 'FairPrice', date: '2024-07-21T09:10:00Z' },
  { id: '10', name: 'Sourdough Bread', price: 7.25, store: 'Giant', date: '2024-07-14T11:00:00Z' },
  { id: '11', name: 'Paper Towels', price: 5.00, store: 'Giant', date: '2024-07-21T09:12:00Z' },
  { id: '12', name: 'Rotisserie Chicken', price: 10.00, store: 'Cold Storage', date: '2024-07-22T18:30:00Z' },
  { id: '13', name: 'Olive Oil', price: 15.00, store: 'FairPrice', date: '2024-07-18T16:00:00Z' },
];

export const getPurchaseHistory = async (): Promise<PurchaseHistoryItem[]> => {
  console.log("Fetching purchase history from mock service...");
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_DATA;
};

import React, { useState } from 'react';
import { ShoppingListItem, PurchaseHistoryItem } from '../types';
import { suggestStore } from '../services/geminiService';
import { CATEGORIES, UNITS } from '../constants';
import { PlusIcon, SparklesIcon, CategoryIcon, CameraIcon, XCircleIcon, ReceiptTextScanIcon } from './icons';

interface AddItemFormProps {
  onAddItem: (item: Omit<ShoppingListItem, 'id'>) => void;
  purchaseHistory: PurchaseHistoryItem[];
  onScanReceipt: () => void;
}

const AddItemForm: React.FC<AddItemFormProps> = ({ onAddItem, purchaseHistory, onScanReceipt }) => {
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [category, setCategory] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);

  const handleGetSuggestion = async () => {
    if (!itemName.trim()) return;
    setIsLoading(true);
    setSuggestion('');
    try {
      const itemHistory = purchaseHistory.filter(
        p => p.name.toLowerCase() === itemName.trim().toLowerCase()
      );
      
      const result = await suggestStore(itemName, itemHistory);
      setSuggestion(result);

    } catch (error) {
      console.error(error);
      setSuggestion('Failed to get suggestion.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;
    onAddItem({ 
      name: itemName.trim(),
      quantity: parseInt(quantity, 10) || 1, 
      unit,
      suggestedStore: suggestion, 
      category: category ? category : undefined,
      imageUrl: imageBase64,
    });
    setItemName('');
    setQuantity('1');
    setUnit('pcs');
    setSuggestion('');
    setCategory('');
    setImageBase64(undefined);
  };

  return (
    <div className="bg-base-200 p-5 rounded-xl shadow-lg">
      <form onSubmit={handleSubmit} acceptCharset="UTF-8" className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="e.g., Organic Almond Milk"
            className="flex-grow bg-base-300 text-base-content rounded-lg p-3 focus:ring-2 focus:ring-brand-primary focus:outline-none transition placeholder-gray-500"
          />
          <div className="flex gap-3 w-full sm:w-auto">
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              aria-label="Quantity"
              className="w-1/2 sm:w-20 bg-base-300 text-base-content rounded-lg p-3 text-center focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-1/2 sm:w-24 bg-base-300 text-base-content rounded-lg p-3 focus:ring-2 focus:ring-brand-primary focus:outline-none transition appearance-none"
              aria-label="Unit"
            >
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <CategoryIcon className="w-5 h-5 text-gray-400" />
                </span>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-base-300 text-base-content rounded-lg p-3 pl-10 focus:ring-2 focus:ring-brand-primary focus:outline-none transition appearance-none"
                    aria-label="Category"
                >
                    <option value="">Select a Category</option>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            <button
                type="button"
                onClick={handleGetSuggestion}
                disabled={isLoading || !itemName.trim()}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-brand-secondary to-purple-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 disabled:from-base-300 disabled:to-base-300 disabled:cursor-not-allowed disabled:text-gray-500 shadow-md hover:shadow-lg"
            >
                <SparklesIcon className="w-5 h-5" />
                <span>{isLoading ? 'Thinking...' : 'AI Suggestion'}</span>
            </button>
        </div>
        
        {suggestion && (
          <div className="bg-base-300/70 p-3 rounded-lg text-sm mt-1">
            <p className="text-gray-400">Suggestion: <span className="font-medium text-base-content">{suggestion}</span></p>
          </div>
        )}

        <div className="flex items-center gap-3">
          <label htmlFor="item-photo-upload" className="flex-grow flex items-center justify-center gap-2 px-4 py-3 bg-base-300 text-gray-300 rounded-lg cursor-pointer hover:bg-gray-600 transition">
              <CameraIcon className="w-5 h-5" />
              <span>{imageBase64 ? "Change Photo" : "Add Photo"}</span>
          </label>
          <input id="item-photo-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          
          {imageBase64 && (
            <div className="relative flex-shrink-0">
              <img src={imageBase64} alt="Item preview" className="w-12 h-12 rounded-lg object-cover border-2 border-base-300"/>
              <button
                type="button"
                onClick={() => setImageBase64(undefined)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition"
                aria-label="Remove image"
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-brand-primary to-indigo-600 text-white font-bold rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 disabled:from-base-300 disabled:to-base-300 disabled:text-gray-500 shadow-lg hover:shadow-glow"
          disabled={!itemName.trim()}
        >
          <PlusIcon className="w-6 h-6" />
          <span>Add to List</span>
        </button>
      </form>
      
      <div className="relative flex items-center my-4">
        <div className="flex-grow border-t border-base-300"></div>
        <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
        <div className="flex-grow border-t border-base-300"></div>
      </div>

      <button
        type="button"
        onClick={onScanReceipt}
        className="w-full flex items-center justify-center gap-2 p-3 bg-base-300 text-base-content font-bold rounded-lg hover:bg-gray-600 transition-all duration-300"
      >
        <ReceiptTextScanIcon className="w-6 h-6" />
        <span>Scan Receipt</span>
      </button>
    </div>
  );
};

export default AddItemForm;

import React, { useState } from 'react';
import { ScannedItem } from '../types';
import { XIcon, TrashIcon } from './icons';

interface ReceiptReviewModalProps {
  items: ScannedItem[];
  onClose: () => void;
  onConfirm: (items: ScannedItem[], store: string) => void;
}

const ReceiptReviewModal: React.FC<ReceiptReviewModalProps> = ({ items, onClose, onConfirm }) => {
  const [editedItems, setEditedItems] = useState<ScannedItem[]>(items);
  const [store, setStore] = useState('');

  const handleItemChange = (index: number, field: keyof ScannedItem, value: string | number) => {
    const newItems = [...editedItems];
    const item = newItems[index];
    if (field === 'name') {
      item.name = value as string;
    } else {
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        item[field] = numValue;
      }
    }
    setEditedItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setEditedItems(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = () => {
    if (!store.trim()) {
      alert("Please enter the store name.");
      return;
    }
    const validItems = editedItems.filter(item => item.name.trim() && item.price > 0 && item.quantity > 0);
    onConfirm(validItems, store.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-base-200 rounded-xl shadow-2xl w-full max-w-2xl p-6 relative flex flex-col max-h-[90vh] animate-fade-in-up border border-base-300">
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-white bg-base-300 hover:bg-gray-600 rounded-full transition-colors">
          <XIcon className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-base-content">Review Scanned Items</h2>
        
        <div className="mb-4">
          <label htmlFor="store-name" className="block text-sm font-medium text-gray-400 mb-1">Store Name</label>
          <input
            id="store-name"
            type="text"
            value={store}
            onChange={(e) => setStore(e.target.value)}
            placeholder="e.g., FairPrice"
            required
            className="w-full bg-base-300 text-base-content rounded-lg p-3 focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
          />
        </div>

        <div className="overflow-y-auto pr-2 flex-grow space-y-3">
          {editedItems.map((item, index) => (
            <div key={index} className="bg-base-300 p-3 rounded-lg flex items-center gap-2">
              <input
                type="text"
                value={item.name}
                onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                placeholder="Item Name"
                className="flex-grow bg-base-100 text-base-content rounded p-2 focus:ring-1 focus:ring-brand-primary focus:outline-none"
              />
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                min="1"
                aria-label="Quantity"
                className="w-20 bg-base-100 text-base-content rounded p-2 text-center focus:ring-1 focus:ring-brand-primary focus:outline-none"
              />
               <input
                type="number"
                value={item.price}
                onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                min="0.01"
                step="0.01"
                aria-label="Price"
                className="w-24 bg-base-100 text-base-content rounded p-2 text-center focus:ring-1 focus:ring-brand-primary focus:outline-none"
              />
              <button
                onClick={() => handleRemoveItem(index)}
                className="p-2 text-red-400 hover:text-white hover:bg-red-500 rounded-full transition-all"
                aria-label="Remove Item"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-base-300">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-base-300 text-base-content rounded-lg hover:bg-gray-600 transition font-semibold">Cancel</button>
            <button 
              type="button" 
              onClick={handleSubmit} 
              disabled={!store.trim() || editedItems.length === 0}
              className="px-5 py-2 bg-gradient-to-r from-brand-primary to-indigo-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:from-base-300 disabled:to-base-300 disabled:text-gray-500"
            >
              Add All to History
            </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptReviewModal;

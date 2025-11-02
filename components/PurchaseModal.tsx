
import React, { useState } from 'react';
import { ShoppingListItem } from '../types';
import { XIcon, CameraIcon } from './icons';

interface PurchaseModalProps {
  item: ShoppingListItem;
  onClose: () => void;
  onConfirm: (item: ShoppingListItem, price: number, store: string, imageUrl?: string) => void;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({ item, onClose, onConfirm }) => {
  const [price, setPrice] = useState('');
  const [store, setStore] = useState('');
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);

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
    const priceValue = parseFloat(price);
    if (!isNaN(priceValue) && priceValue > 0 && store.trim()) {
      onConfirm(item, priceValue, store.trim(), imageBase64);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-base-200 rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-fade-in-up border border-base-300">
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-white bg-base-300 hover:bg-gray-600 rounded-full transition-colors">
          <XIcon className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold mb-2 text-base-content">Log Purchase</h2>
        <p className="mb-6 text-gray-400">Item: <span className="font-semibold text-brand-primary">{item.name}</span></p>

        <form onSubmit={handleSubmit} acceptCharset="UTF-8" className="space-y-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-400 mb-1">Price ($)</label>
            <input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g., 4.99"
              min="0.01"
              step="0.01"
              required
              className="w-full bg-base-300 text-base-content rounded-lg p-3 focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
            />
          </div>
          <div>
            <label htmlFor="store" className="block text-sm font-medium text-gray-400 mb-1">Store</label>
            <input
              id="store"
              type="text"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              placeholder="e.g., FairPrice"
              required
              className="w-full bg-base-300 text-base-content rounded-lg p-3 focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Add Photo (Optional)</label>
            <label htmlFor="item-photo" className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-base-300 text-gray-300 rounded-lg cursor-pointer hover:bg-gray-600 transition">
              <CameraIcon className="w-5 h-5" />
              <span>{imageBase64 ? "Change Photo" : "Take or Upload Photo"}</span>
            </label>
            <input
              id="item-photo"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              className="hidden"
            />
            {imageBase64 && (
              <div className="mt-4 flex justify-center">
                <img src={imageBase64} alt="Item preview" className="w-28 h-28 rounded-lg object-cover border-2 border-base-300"/>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-base-300 text-base-content rounded-lg hover:bg-gray-600 transition font-semibold">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-gradient-to-r from-brand-primary to-indigo-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg">Confirm Purchase</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseModal;
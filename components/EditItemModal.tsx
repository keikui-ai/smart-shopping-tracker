import React, { useState, useEffect } from 'react';
import { ShoppingListItem } from '../types';
import { CATEGORIES, UNITS } from '../constants';
import { XIcon, CameraIcon, XCircleIcon, CategoryIcon } from './icons';

interface EditItemModalProps {
  item: ShoppingListItem;
  onClose: () => void;
  onConfirm: (item: ShoppingListItem) => void;
}

const EditItemModal: React.FC<EditItemModalProps> = ({ item, onClose, onConfirm }) => {
  const [itemName, setItemName] = useState(item.name);
  const [quantity, setQuantity] = useState(String(item.quantity));
  const [unit, setUnit] = useState(item.unit || 'pcs');
  const [category, setCategory] = useState(item.category || '');
  const [imageBase64, setImageBase64] = useState<string | undefined>(item.imageUrl);

  useEffect(() => {
    setItemName(item.name);
    setQuantity(String(item.quantity));
    setUnit(item.unit || 'pcs');
    setCategory(item.category || '');
    setImageBase64(item.imageUrl);
  }, [item]);

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

    const updatedItem: ShoppingListItem = {
      ...item,
      name: itemName.trim(),
      quantity: parseInt(quantity, 10) || 1,
      unit,
      category: category ? category : undefined,
      imageUrl: imageBase64,
    };
    onConfirm(updatedItem);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-base-200 rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-fade-in-up border border-base-300">
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-white bg-base-300 hover:bg-gray-600 rounded-full transition-colors">
          <XIcon className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-base-content">Edit Item</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="itemName" className="block text-sm font-medium text-gray-400 mb-1">Item Name</label>
            <input
              id="itemName"
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full bg-base-300 text-base-content rounded-lg p-3 focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
              required
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-400 mb-1">Quantity</label>
              <input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                className="w-full bg-base-300 text-base-content rounded-lg p-3 focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
                required
              />
            </div>
            <div className="flex-1">
              <label htmlFor="unit" className="block text-sm font-medium text-gray-400 mb-1">Unit</label>
              <select
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-base-300 text-base-content rounded-lg p-3 focus:ring-2 focus:ring-brand-primary focus:outline-none transition appearance-none"
              >
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          
          <div className="relative">
             <label htmlFor="category" className="block text-sm font-medium text-gray-400 mb-1">Category</label>
             <span className="absolute bottom-3 left-3 flex items-center pointer-events-none">
                <CategoryIcon className="w-5 h-5 text-gray-400" />
            </span>
            <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-base-300 text-base-content rounded-lg p-3 pl-10 focus:ring-2 focus:ring-brand-primary focus:outline-none transition appearance-none"
            >
                <option value="">Select a Category</option>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          
          <div className="flex items-center gap-3">
            <label htmlFor="edit-item-photo" className="flex-grow flex items-center justify-center gap-2 px-4 py-3 bg-base-300 text-gray-300 rounded-lg cursor-pointer hover:bg-gray-600 transition">
                <CameraIcon className="w-5 h-5" />
                <span>{imageBase64 ? "Change Photo" : "Add Photo"}</span>
            </label>
            <input id="edit-item-photo" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            
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

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-base-300 text-base-content rounded-lg hover:bg-gray-600 transition font-semibold">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-gradient-to-r from-brand-primary to-indigo-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItemModal;

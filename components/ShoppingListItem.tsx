import React from 'react';
import { ShoppingListItem as ShoppingListItemType } from '../types';
import { TrashIcon, CheckCircleIcon, LocationMarkerIcon, PencilIcon } from './icons';

interface ShoppingListItemProps {
  item: ShoppingListItemType;
  onRemove: (id: string) => void;
  onPurchase: (item: ShoppingListItemType) => void;
  onEdit: (item: ShoppingListItemType) => void;
}

const ShoppingListItem: React.FC<ShoppingListItemProps> = ({ item, onRemove, onPurchase, onEdit }) => {
  return (
    <li className="bg-base-300/70 p-3 rounded-lg flex items-center justify-between gap-3 transition-all duration-200 hover:bg-base-300 hover:scale-[1.02] hover:shadow-lg">
      <div className="flex-grow flex items-center gap-3">
        {item.imageUrl && (
          <img src={item.imageUrl} alt={item.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border-2 border-base-100" />
        )}
        <div className="flex-grow">
          <p className="font-semibold text-base-content">
            {item.name}
          </p>
          <div className="flex items-center flex-wrap gap-2 mt-1.5">
            {(item.quantity > 1 || (item.unit && item.unit !== 'pcs')) && (
              <span className="text-xs font-medium bg-base-100/50 text-gray-300 px-2 py-0.5 rounded-full">
                {item.unit === 'pcs' || !item.unit ? `x${item.quantity}` : `${item.quantity} ${item.unit}`}
              </span>
            )}
            {item.category && (
              <span className="text-xs font-medium bg-brand-secondary/20 text-purple-300 px-2 py-0.5 rounded-full">
                {item.category}
              </span>
            )}
          </div>
          {item.suggestedStore && (
            <p className="text-xs text-purple-400 flex items-center gap-1.5 mt-1.5 font-medium">
              <LocationMarkerIcon className="w-3.5 h-3.5"/>
              {item.suggestedStore}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onPurchase(item)}
          className="p-2 text-green-400 hover:text-white hover:bg-green-500 rounded-full transition-all duration-200"
          aria-label="Purchase Item"
        >
          <CheckCircleIcon className="w-6 h-6" />
        </button>
        <button
          onClick={() => onEdit(item)}
          className="p-2 text-blue-400 hover:text-white hover:bg-blue-500 rounded-full transition-all duration-200"
          aria-label="Edit Item"
        >
          <PencilIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => onRemove(item.id)}
          className="p-2 text-red-400 hover:text-white hover:bg-red-500 rounded-full transition-all duration-200"
          aria-label="Remove Item"
        >
          <TrashIcon className="w-6 h-6" />
        </button>
      </div>
    </li>
  );
};

export default ShoppingListItem;
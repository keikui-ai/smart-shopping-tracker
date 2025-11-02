
import React from 'react';
import { ShoppingListItem as ShoppingListItemType } from '../types';
import ShoppingListItem from './ShoppingListItem';
import { EmptyListIcon, CategoryIcon } from './icons';

interface ShoppingListProps {
  items: ShoppingListItemType[];
  onRemove: (id: string) => void;
  onPurchase: (item: ShoppingListItemType) => void;
  onEdit: (item: ShoppingListItemType) => void;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ items, onRemove, onPurchase, onEdit }) => {
  if (items.length === 0) {
    return (
      <div className="bg-base-200 p-8 rounded-xl text-center flex flex-col items-center justify-center min-h-[200px] shadow-lg border-2 border-dashed border-base-300">
        <EmptyListIcon className="w-16 h-16 text-base-300 mb-4" />
        <p className="text-base-content font-semibold text-lg">Your shopping list is empty.</p>
        <p className="text-sm text-gray-400 mt-1">Add an item above to get started!</p>
      </div>
    );
  }

  const groupedItems = items.reduce((acc, item) => {
    const category = item.category?.trim() || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ShoppingListItemType[]>);

  const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
    if (a === 'Uncategorized') return 1;
    if (b === 'Uncategorized') return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="bg-base-200 p-4 rounded-xl shadow-lg">
      <div className="space-y-6">
        {sortedCategories.map(category => (
          <div key={category}>
            <h3 className="text-lg font-bold text-base-content mb-3 flex items-center gap-2 border-b-2 border-base-300 pb-2 capitalize">
              <CategoryIcon className="w-6 h-6 text-brand-secondary" />
              <span>{category}</span>
            </h3>
            <ul className="space-y-3">
              {groupedItems[category].map(item => (
                <ShoppingListItem 
                  key={item.id}
                  item={item}
                  onRemove={onRemove}
                  onPurchase={onPurchase}
                  onEdit={onEdit}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShoppingList;
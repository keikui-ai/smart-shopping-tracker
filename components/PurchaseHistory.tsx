import React, { useMemo } from 'react';
import { PurchaseHistoryItem } from '../types';
import { HistoryIcon, EmptyHistoryIcon, StoreIcon, PriceTagIcon } from './icons';

interface PurchaseHistoryProps {
  history: PurchaseHistoryItem[];
  onViewItemHistory: (itemName:string) => void;
  isLoading: boolean;
}

const PurchaseHistory: React.FC<PurchaseHistoryProps> = ({ history, onViewItemHistory, isLoading }) => {
  const groupedHistory = useMemo(() => {
    return history.reduce((acc, purchase) => {
      const normalizedName = purchase.name.trim().toLowerCase();
      const existing = acc[normalizedName];

      if (!existing) {
        acc[normalizedName] = { 
          count: 1, 
          lastPurchase: purchase,
        };
      } else {
        if (new Date(purchase.date) > new Date(existing.lastPurchase.date)) {
          existing.lastPurchase = purchase;
        }
        existing.count += 1;
      }
      return acc;
    }, {} as Record<string, { count: number; lastPurchase: PurchaseHistoryItem }>);
  }, [history]);
  
  const sortedItemKeys = Object.keys(groupedHistory).sort((a, b) => 
    new Date(groupedHistory[b].lastPurchase.date).getTime() - new Date(groupedHistory[a].lastPurchase.date).getTime()
  );

  if (isLoading) {
    return (
      <div className="bg-base-200 p-8 rounded-xl text-center flex flex-col items-center justify-center min-h-[200px] shadow-lg">
        <p className="text-gray-400 animate-pulse">Loading purchase history...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-base-200 p-8 rounded-xl text-center flex flex-col items-center justify-center min-h-[200px] shadow-lg border-2 border-dashed border-base-300">
        <EmptyHistoryIcon className="w-16 h-16 text-base-300 mb-4" />
        <p className="text-base-content font-semibold text-lg">No purchases yet.</p>
        <p className="text-sm text-gray-400 mt-1">Buy an item from your list to see it here.</p>
      </div>
    );
  }

  return (
    <div className="bg-base-200 p-4 rounded-xl shadow-lg">
      <div className="pr-2">
        <ul className="space-y-3">
          {sortedItemKeys.slice(0, 10).map(key => {
            const data = groupedHistory[key];
            const displayName = data.lastPurchase.name;
            return (
              <li key={key}>
                <button
                  onClick={() => onViewItemHistory(key)}
                  className="w-full bg-base-300 p-3 rounded-lg flex items-center justify-between gap-4 text-left transition-all duration-200 hover:bg-base-300/80 hover:scale-[1.02] hover:shadow-md"
                >
                  {data.lastPurchase.imageUrl && (
                     <img src={data.lastPurchase.imageUrl} alt={displayName} className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border-2 border-base-100" />
                  )}
                  <div className="flex-grow overflow-hidden">
                    <p className="font-bold text-base-content truncate text-lg">{displayName}</p>
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400 mt-1">
                      <span>
                        Purchased {data.count} time{data.count > 1 ? 's' : ''}
                      </span>
                      <div className="flex items-center gap-1.5">
                          <PriceTagIcon className="w-3.5 h-3.5 flex-shrink-0 text-green-400"/>
                          <span className="font-medium text-gray-300">${data.lastPurchase.price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                          <StoreIcon className="w-3.5 h-3.5 flex-shrink-0"/>
                          <span className="truncate">{data.lastPurchase.store}</span>
                      </div>
                    </div>
                  </div>
                  <HistoryIcon className="w-6 h-6 text-gray-500 flex-shrink-0" />
                </button>
              </li>
            )
          })}
        </ul>
         {sortedItemKeys.length > 10 && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Showing the 10 most recent items.
          </p>
        )}
      </div>
    </div>
  );
};

export default PurchaseHistory;
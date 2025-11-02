
import React from 'react';
import { PurchaseHistoryItem } from '../types';
import { XIcon, PriceTagIcon, StoreIcon, CalendarIcon, ChartLineIcon } from './icons';

interface ItemHistoryModalProps {
  itemName: string;
  history: PurchaseHistoryItem[];
  onClose: () => void;
}

const PriceHistoryChart: React.FC<{ data: PurchaseHistoryItem[] }> = ({ data }) => {
  if (data.length < 2) {
    return (
      <div className="text-center text-gray-500 p-4 bg-base-300/50 rounded-lg">
        <p>Not enough data for a price trend chart.</p>
        <p className="text-sm">Log at least two purchases to see the trend.</p>
      </div>
    );
  }

  const PADDING = 40;
  const SVG_WIDTH = 450;
  const SVG_HEIGHT = 200;

  const prices = data.map(p => p.price);
  const dates = data.map(p => new Date(p.date).getTime());

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  
  const priceRange = maxPrice - minPrice === 0 ? 1 : maxPrice - minPrice;
  const dateRange = maxDate - minDate === 0 ? 1 : maxDate - minDate;

  const getCoords = (price: number, date: string) => {
    const x = ((new Date(date).getTime() - minDate) / dateRange) * (SVG_WIDTH - PADDING * 2) + PADDING;
    const y = SVG_HEIGHT - (((price - minPrice) / priceRange) * (SVG_HEIGHT - PADDING * 2) + PADDING);
    return { x, y };
  };

  const points = data.map(item => {
    const { x, y } = getCoords(item.price, item.date);
    return `${x},${y}`;
  }).join(' ');
      
  const yAxisLabels = [];
  const numLabels = Math.min(priceRange > 0 ? 4 : 1, data.length);
  if (numLabels === 1) {
    yAxisLabels.push({ price: minPrice, y: getCoords(minPrice, data[0].date).y });
  } else {
    for (let i = 0; i < numLabels; i++) {
        const price = minPrice + (priceRange / (numLabels - 1)) * i;
        const { y } = getCoords(price, data[0].date);
        yAxisLabels.push({ price, y });
    }
  }

  return (
    <div className="bg-base-300/50 p-3 rounded-lg">
      <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full h-auto" aria-label={`Price history chart for ${data[0].name}`}>
        {yAxisLabels.map(({ price, y }) => (
            <g key={price}>
                <line x1={PADDING} y1={y} x2={SVG_WIDTH - PADDING} y2={y} stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
                <text x={PADDING - 8} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="10">
                    ${price.toFixed(2)}
                </text>
            </g>
        ))}
        
        <text x={PADDING} y={SVG_HEIGHT - PADDING + 20} textAnchor="start" fill="#94a3b8" fontSize="10">
            {new Date(minDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
        </text>
         <text x={SVG_WIDTH - PADDING} y={SVG_HEIGHT - PADDING + 20} textAnchor="end" fill="#94a3b8" fontSize="10">
            {new Date(maxDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
        </text>

        <polyline
            fill="none"
            stroke="#a78bfa"
            strokeWidth="2.5"
            points={points}
        />

        {data.map((item, index) => {
             const { x, y } = getCoords(item.price, item.date);
             return (
                 <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#7c3aed"
                    stroke="#1e293b"
                    strokeWidth="2"
                />
             );
        })}
      </svg>
    </div>
  );
};

const ItemHistoryModal: React.FC<ItemHistoryModalProps> = ({ itemName, history, onClose }) => {
  const sortedHistoryForChart = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const sortedHistoryForList = [...sortedHistoryForChart].reverse();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-base-200 rounded-xl shadow-2xl w-full max-w-2xl p-6 relative flex flex-col max-h-[90vh] animate-fade-in-up border border-base-300">
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-white bg-base-300 hover:bg-gray-600 rounded-full transition-colors">
          <XIcon className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-base-content border-l-4 border-brand-secondary pl-4">
          History for <span className="text-brand-secondary">{itemName}</span>
        </h2>
        
        <div className="overflow-y-auto pr-2 flex-grow space-y-6">
          <section>
            <h3 className="text-xl font-semibold text-gray-300 mb-3 flex items-center gap-3">
              <ChartLineIcon className="w-6 h-6" />
              Price Trend
            </h3>
            <PriceHistoryChart data={sortedHistoryForChart} />
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-300 mb-3">Purchase List</h3>
            <ul className="space-y-3">
              {sortedHistoryForList.map(item => (
                <li key={item.id} className="bg-base-300 p-4 rounded-lg flex gap-4 items-start">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.name} className="w-20 h-20 rounded-lg object-cover flex-shrink-0 border-2 border-base-100" />
                  )}
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-green-400">
                            <PriceTagIcon className="w-5 h-5" />
                            <span className="font-bold text-xl">${item.price.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <CalendarIcon className="w-4 h-4"/>
                            <span>{new Date(item.date).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-base text-gray-300">
                        <StoreIcon className="w-4 h-4"/>
                        <span className="font-semibold">{item.store}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ItemHistoryModal;
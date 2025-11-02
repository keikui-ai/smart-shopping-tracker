import React, { useState, useEffect } from 'react';
import { ShoppingListItem, PurchaseHistoryItem, ScannedItem } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { getPurchaseHistory } from './services/googleSheetService';
import { extractItemsFromReceipt } from './services/geminiService';
import AddItemForm from './components/AddItemForm';
import ShoppingList from './components/ShoppingList';
import PurchaseHistory from './components/PurchaseHistory';
import PurchaseModal from './components/PurchaseModal';
import ItemHistoryModal from './components/ItemHistoryModal';
import LoginScreen from './components/LoginScreen';
import BottomNavBar from './components/BottomNavBar';
import EditItemModal from './components/EditItemModal';
import ReceiptScannerModal from './components/ReceiptScannerModal';
import ReceiptReviewModal from './components/ReceiptReviewModal';
import { ShoppingBagIcon, PlusCircleIcon, ClipboardListIcon, HistoryIcon } from './components/icons';

const App: React.FC = () => {
  const [shoppingList, setShoppingList] = useLocalStorage<ShoppingListItem[]>('shoppingList', []);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistoryItem[]>([]);
  
  const [purchasingItem, setPurchasingItem] = useState<ShoppingListItem | null>(null);
  const [editingItem, setEditingItem] = useState<ShoppingListItem | null>(null);
  const [viewingHistoryItemName, setViewingHistoryItemName] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(sessionStorage.getItem('isLoggedIn') === 'true');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'history'>('list');
  
  // State for receipt scanning feature
  const [isScanning, setIsScanning] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [isProcessingReceipt, setIsProcessingReceipt] = useState(false);


  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      const historyData = await getPurchaseHistory();
      setPurchaseHistory(historyData);
      setIsLoadingHistory(false);
    };
    
    if (isLoggedIn) {
      fetchHistory();
    }
  }, [isLoggedIn]);

  const handleLoginSuccess = () => {
    sessionStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
  };

  const handleAddItem = (item: Omit<ShoppingListItem, 'id'>) => {
    const isDuplicate = shoppingList.some(
      existingItem => existingItem.name.trim().toLowerCase() === item.name.trim().toLowerCase()
    );

    if (isDuplicate) {
      alert('This item is already on your list.');
      return;
    }

    const newItem: ShoppingListItem = {
      ...item,
      id: new Date().toISOString(),
    };
    setShoppingList(prev => [...prev, newItem]);
    setActiveTab('list'); // Switch to list view after adding an item
  };

  const handleRemoveItem = (id: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== id));
  };

  const handleStartPurchase = (item: ShoppingListItem) => {
    setPurchasingItem(item);
  };

  const handleConfirmPurchase = (item: ShoppingListItem, price: number, store: string, imageUrl?: string) => {
    const newPurchase: PurchaseHistoryItem = {
      id: new Date().toISOString(),
      name: item.name,
      price,
      store,
      date: new Date().toISOString(),
      imageUrl,
    };
    setPurchaseHistory(prev => [newPurchase, ...prev]);
    setShoppingList(prev => prev.filter(i => i.id !== item.id));
    setPurchasingItem(null);
  };

  const handleViewHistory = (itemName: string) => {
    setViewingHistoryItemName(itemName);
  };

  const handleStartEdit = (item: ShoppingListItem) => {
    setEditingItem(item);
  };

  const handleConfirmEdit = (updatedItem: ShoppingListItem) => {
    setShoppingList(prevList =>
      prevList.map(item => (item.id === updatedItem.id ? updatedItem : item))
    );
    setEditingItem(null);
  };

  const handleScanReceipt = () => {
    setIsScanning(true);
  };

  const handleCaptureReceipt = async (imageBase64: string) => {
    setIsScanning(false);
    setIsProcessingReceipt(true);
    try {
      const items = await extractItemsFromReceipt(imageBase64);
      if (items.length === 0) {
        throw new Error("No items could be extracted from the receipt. Please try again with a clearer image.");
      }
      setScannedItems(items);
      setIsReviewing(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while scanning.";
      alert(errorMessage);
    } finally {
      setIsProcessingReceipt(false);
    }
  };

  const handleConfirmReview = (items: ScannedItem[], store: string) => {
    const newPurchases: PurchaseHistoryItem[] = items.map(item => ({
      id: `${new Date().toISOString()}-${item.name}-${Math.random()}`,
      name: item.name,
      price: item.price,
      store,
      date: new Date().toISOString(),
    }));

    setPurchaseHistory(prev => [...newPurchases, ...prev]);
    setIsReviewing(false);
    setScannedItems([]);
    setActiveTab('history');
  };


  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }
  
  const itemsInHistory = viewingHistoryItemName
    ? purchaseHistory.filter(p => p.name.trim().toLowerCase() === viewingHistoryItemName.trim().toLowerCase())
    : [];
  
  const displayNameForModal = itemsInHistory.length > 0
    ? [...itemsInHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].name
    : viewingHistoryItemName;

  return (
    <div className="h-screen bg-base-100 flex flex-col">
      <header className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg shrink-0">
        <div className="container mx-auto flex items-center justify-center gap-3 p-4">
          <ShoppingBagIcon className="w-8 h-8" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Smart Shopping Tracker
          </h1>
        </div>
      </header>
      
      <main className="flex-grow overflow-y-auto lg:overflow-hidden lg:grid lg:grid-cols-3 lg:gap-8 lg:p-8">
        {/* Column 1: Add Item */}
        <div className={`${activeTab === 'add' ? 'block' : 'hidden'} lg:flex flex-col gap-4 lg:overflow-y-auto p-4 lg:p-0`}>
          <h2 className="text-2xl font-semibold text-base-content flex items-center gap-3 lg:hidden">
            <PlusCircleIcon className="w-7 h-7 text-brand-primary" />
            Add New Item
          </h2>
          <AddItemForm onAddItem={handleAddItem} purchaseHistory={purchaseHistory} onScanReceipt={handleScanReceipt} />
        </div>
        
        {/* Column 2: Current List */}
        <div className={`${activeTab === 'list' ? 'block' : 'hidden'} lg:flex flex-col gap-4 lg:overflow-y-auto p-4 lg:p-0`}>
           <h2 className="text-2xl font-semibold mb-4 text-base-content flex items-center gap-3 lg:hidden">
            <ClipboardListIcon className="w-7 h-7 text-brand-primary" />
            Current List
           </h2>
          <ShoppingList 
            items={shoppingList} 
            onRemove={handleRemoveItem}
            onPurchase={handleStartPurchase}
            onEdit={handleStartEdit}
          />
        </div>
        
        {/* Column 3: Purchase History */}
        <div className={`${activeTab === 'history' ? 'block' : 'hidden'} lg:flex flex-col gap-4 lg:overflow-y-auto p-4 lg:p-0`}>
          <h2 className="text-2xl font-semibold mb-4 text-base-content flex items-center gap-3 lg:hidden">
            <HistoryIcon className="w-7 h-7 text-brand-secondary" />
            Purchase History
          </h2>
          <PurchaseHistory 
            history={purchaseHistory}
            onViewItemHistory={handleViewHistory}
            isLoading={isLoadingHistory}
          />
        </div>
      </main>

      <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />

      {purchasingItem && (
        <PurchaseModal 
          item={purchasingItem}
          onClose={() => setPurchasingItem(null)}
          onConfirm={handleConfirmPurchase}
        />
      )}

      {editingItem && (
        <EditItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onConfirm={handleConfirmEdit}
        />
      )}

      {viewingHistoryItemName && itemsInHistory.length > 0 && (
        <ItemHistoryModal
          itemName={displayNameForModal || ''}
          history={itemsInHistory}
          onClose={() => setViewingHistoryItemName(null)}
        />
      )}

      {isProcessingReceipt && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4 flex-col gap-4">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-brand-primary"></div>
          <p className="text-white text-lg font-semibold">Analyzing your receipt...</p>
        </div>
      )}

      {isScanning && (
        <ReceiptScannerModal 
          onClose={() => setIsScanning(false)}
          onCapture={handleCaptureReceipt}
        />
      )}

      {isReviewing && (
        <ReceiptReviewModal
          items={scannedItems}
          onClose={() => setIsReviewing(false)}
          onConfirm={handleConfirmReview}
        />
      )}
    </div>
  );
};

export default App;

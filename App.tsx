import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingListItem, PurchaseHistoryItem, ScannedItem, ToastMessage, ToastType, User } from './types';
import { getPurchaseHistory, addPurchaseHistoryItems } from './services/googleSheetService';
import { extractItemsFromReceipt } from './services/geminiService';
import { authService } from './services/authService';
import AddItemForm from './components/AddItemForm';
import ShoppingList from './components/ShoppingList';
import PurchaseHistory from './components/PurchaseHistory';
import PurchaseModal from './components/PurchaseModal';
import ItemHistoryModal from './components/ItemHistoryModal';
import BottomNavBar from './components/BottomNavBar';
import EditItemModal from './components/EditItemModal';
import ReceiptScannerModal from './components/ReceiptScannerModal';
import ReceiptReviewModal from './components/ReceiptReviewModal';
import AuthScreen from './components/AuthScreen';
import { ToastContainer } from './components/Toast';
import { ShoppingBagIcon, PlusCircleIcon, ClipboardListIcon, HistoryIcon, LogOutIcon } from './components/icons';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  // Initialize shopping list state without localStorage hook
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistoryItem[]>([]);
  
  const [purchasingItem, setPurchasingItem] = useState<ShoppingListItem | null>(null);
  const [editingItem, setEditingItem] = useState<ShoppingListItem | null>(null);
  const [viewingHistoryItemName, setViewingHistoryItemName] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'history'>('list');
  
  const [isScanning, setIsScanning] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [isProcessingReceipt, setIsProcessingReceipt] = useState(false);
  
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const newToast: ToastMessage = {
      id: Date.now() + Math.random(),
      message,
      type,
    };
    setToasts(prevToasts => [...prevToasts, newToast]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  // Handle authentication state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(currentUser => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load shopping list from localStorage when user changes
  useEffect(() => {
    if (!user) {
      setShoppingList([]);
      return;
    }

    try {
      const stored = localStorage.getItem(`shoppingList_${user.id}`);
      if (stored) {
        setShoppingList(JSON.parse(stored));
      } else {
        setShoppingList([]);
      }
    } catch (error) {
      console.error('Error loading shopping list:', error);
      setShoppingList([]);
    }
  }, [user]);

  // Save shopping list to localStorage whenever it changes
  useEffect(() => {
    if (!user) return;

    try {
      localStorage.setItem(`shoppingList_${user.id}`, JSON.stringify(shoppingList));
    } catch (error) {
      console.error('Error saving shopping list:', error);
      showToast('Failed to save shopping list locally.', 'error');
    }
  }, [shoppingList, user, showToast]);

  // Fetch purchase history when user changes
  useEffect(() => {
    if (!user) {
      setPurchaseHistory([]);
      setIsLoadingHistory(false);
      return;
    }

    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const historyData = await getPurchaseHistory(user);
        setPurchaseHistory(historyData);
      } catch (error) {
        console.error("Failed to fetch purchase history:", error);
        showToast('Could not load purchase history.', 'error');
      } finally {
        setIsLoadingHistory(false);
      }
    };
    
    fetchHistory();
  }, [user, showToast]);

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      // Clear local state
      setShoppingList([]);
      setPurchaseHistory([]);
      setActiveTab('list');
    } catch (error) {
      console.error('Error signing out:', error);
      showToast('Failed to sign out.', 'error');
    }
  };

  const handleAddItem = (item: Omit<ShoppingListItem, 'id'>) => {
    const isDuplicate = shoppingList.some(
      existingItem => existingItem.name.trim().toLowerCase() === item.name.trim().toLowerCase()
    );

    if (isDuplicate) {
      showToast('This item is already on your list.', 'info');
      return;
    }

    const newItem: ShoppingListItem = {
      ...item,
      id: `${Date.now()}-${Math.random()}`, // More unique ID
    };
    setShoppingList(prev => [...prev, newItem]);
    showToast(`${item.name} added to list`, 'success');
    setActiveTab('list');
  };

  const handleRemoveItem = (id: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== id));
    showToast('Item removed from list', 'info');
  };

  const handleStartPurchase = (item: ShoppingListItem) => {
    setPurchasingItem(item);
  };

  const handleConfirmPurchase = async (item: ShoppingListItem, price: number, store: string, imageUrl?: string) => {
    if (!user) {
      showToast('You must be logged in to perform this action.', 'error');
      return;
    }
    
    const newPurchase: PurchaseHistoryItem = {
      id: `${Date.now()}-${Math.random()}`,
      name: item.name,
      price,
      store,
      date: new Date().toISOString(),
      imageUrl,
    };
    
    setPurchaseHistory(prev => [newPurchase, ...prev]);
    setShoppingList(prev => prev.filter(i => i.id !== item.id));
    setPurchasingItem(null);

    try {
      await addPurchaseHistoryItems([newPurchase], user);
      showToast(`${item.name} logged successfully!`, 'success');
    } catch (error) {
      console.error("Failed to save purchase:", error);
      showToast(`Failed to save purchase for ${item.name}.`, 'error');
    }
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
    showToast('Item updated', 'success');
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
      showToast(errorMessage, 'error');
    } finally {
      setIsProcessingReceipt(false);
    }
  };

  const handleConfirmReview = async (items: ScannedItem[], store: string) => {
    if (!user) {
      showToast('You must be logged in to perform this action.', 'error');
      return;
    }
    
    const newPurchases: PurchaseHistoryItem[] = items.map(item => ({
      id: `${Date.now()}-${item.name}-${Math.random()}`,
      name: item.name,
      price: item.price,
      store,
      date: new Date().toISOString(),
    }));

    setPurchaseHistory(prev => [...newPurchases, ...prev]);
    setIsReviewing(false);
    setScannedItems([]);
    
    try {
      await addPurchaseHistoryItems(newPurchases, user);
      showToast(`${newPurchases.length} items added to history`, 'success');
    } catch (error) {
      console.error("Failed to save receipt items:", error);
      showToast('Failed to save receipt items.', 'error');
    }
    setActiveTab('history');
  };
  
  const itemsInHistory = viewingHistoryItemName
    ? purchaseHistory.filter(p => p.name.trim().toLowerCase() === viewingHistoryItemName.trim().toLowerCase())
    : [];
  
  const displayNameForModal = itemsInHistory.length > 0
    ? [...itemsInHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].name
    : viewingHistoryItemName;

  if (isAuthLoading) {
    return (
      <div className="h-screen bg-base-100 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-brand-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="h-screen bg-base-100 flex flex-col">
      <header className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg shrink-0">
        <div className="container mx-auto flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
                <ShoppingBagIcon className="w-8 h-8" />
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    Smart Shopping Tracker
                </h1>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all duration-200"
              aria-label="Sign Out"
            >
              <LogOutIcon className="w-6 h-6" />
            </button>
        </div>
      </header>
      
      <main className="flex-grow overflow-y-auto lg:overflow-hidden lg:grid lg:grid-cols-3 lg:gap-8 lg:p-8 mb-16 lg:mb-0">
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
      
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

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

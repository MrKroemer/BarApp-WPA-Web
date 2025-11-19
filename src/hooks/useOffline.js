import { useState, useEffect } from 'react';
import { useDataStore } from '../store/useStore';

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const { products, orders, customers } = useDataStore();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processOfflineQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      cacheEssentialData();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const cacheEssentialData = () => {
    try {
      localStorage.setItem('offline_products', JSON.stringify(products));
      localStorage.setItem('offline_orders', JSON.stringify(orders));
      localStorage.setItem('offline_customers', JSON.stringify(customers));
      localStorage.setItem('offline_timestamp', Date.now().toString());
    } catch (error) {
      console.error('Error caching data:', error);
    }
  };

  const getCachedData = (type) => {
    try {
      const data = localStorage.getItem(`offline_${type}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting cached data:', error);
      return [];
    }
  };

  const addToOfflineQueue = (action) => {
    const queueItem = {
      id: Date.now(),
      action,
      timestamp: new Date().toISOString()
    };
    
    setOfflineQueue(prev => [...prev, queueItem]);
    localStorage.setItem('offline_queue', JSON.stringify([...offlineQueue, queueItem]));
  };

  const processOfflineQueue = async () => {
    const queue = JSON.parse(localStorage.getItem('offline_queue') || '[]');
    
    for (const item of queue) {
      try {
        // Process each queued action when back online
        await item.action();
      } catch (error) {
        console.error('Error processing offline action:', error);
      }
    }
    
    // Clear queue after processing
    localStorage.removeItem('offline_queue');
    setOfflineQueue([]);
  };

  return {
    isOnline,
    offlineQueue: offlineQueue.length,
    getCachedData,
    addToOfflineQueue,
    cacheEssentialData
  };
};
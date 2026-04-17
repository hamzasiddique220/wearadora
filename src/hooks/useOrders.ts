'use client';

import { useEffect, useState } from 'react';
import { orderService } from '@/lib/services/orders';
import { Order } from '@/types';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = orderService.subscribe((items) => {
      setOrders(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { orders, loading };
};

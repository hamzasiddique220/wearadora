'use client';

import { useEffect, useState } from 'react';
import { productService } from '@/lib/services/products';
import { Product } from '@/types';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = productService.subscribe((items) => {
      setProducts(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { products, loading, error };
};

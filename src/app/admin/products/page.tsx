'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { Product, ProductType } from '@/types';
import { useProducts } from '@/hooks/useProducts';
import { productService } from '@/lib/services/products';
import { useUIStore } from '@/lib/stores/ui';
import { formatPrice } from '@/lib/utils';
import { getProductType } from '@/lib/constants';
import ProductForm from '@/components/admin/ProductForm';
import EmptyState from '@/components/ui/EmptyState';

export default function AdminProductsPage() {
  const { products } = useProducts();
  const showToast = useUIStore((state) => state.showToast);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | ProductType>('all');

  const filtered = useMemo(() => {
    if (typeFilter === 'all') return products;
    return products.filter(
      (p) => (p.productType || getProductType(p.category as string)) === typeFilter
    );
  }, [products, typeFilter]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.delete(id);
      showToast('Product deleted');
    } catch (error) {
      showToast('Delete failed', 'error');
    }
  };

  const handleEdit = (product: Product) => {
    setEditing(product);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditing(null);
    setShowForm(true);
  };

  return (
    <>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-8">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <span className="text-[10px] tracking-[0.4em] uppercase text-bronze">
              ✦ Inventory
            </span>
            <h1 className="font-serif text-4xl mt-2">
              Products ({products.length})
            </h1>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {(
              [
                ['all', 'All'],
                ['slippers', 'Footwear'],
                ['jewelry', 'Jewelry'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTypeFilter(key)}
                className={`px-3 py-1.5 text-[10px] tracking-[0.2em] uppercase border ${
                  typeFilter === key
                    ? 'bg-charcoal text-white border-charcoal'
                    : 'bg-white border-stone'
                }`}
              >
                {label}
              </button>
            ))}
            <button onClick={handleNew} className="btn-primary flex items-center gap-2">
              <Plus size={14} /> New Product
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            message={
              products.length === 0
                ? "No products yet. Click 'New Product' to add your first one."
                : 'No products match this filter.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <div key={p.id} className="bg-white overflow-hidden">
                <div className="relative aspect-[4/3] bg-sand">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <div className="text-[9px] tracking-[0.3em] uppercase text-bronze">
                      {p.category}
                    </div>
                    {p.sku && (
                      <code className="text-[10px] font-mono bg-sand text-charcoal px-2 py-0.5 rounded-sm">
                        {p.sku}
                      </code>
                    )}
                  </div>
                  <h3 className="font-serif text-lg mb-1">{p.name}</h3>
                  {p.tag && (
                    <div className="text-[10px] tracking-[0.15em] uppercase text-mocha mb-2">
                      #{p.tag}
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">{formatPrice(p.price)}</span>
                    <span className="text-xs text-mocha">Stock: {p.stock}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(p)}
                      className="flex-1 border border-stone py-2 text-[10px] tracking-[0.2em] uppercase hover:bg-charcoal hover:text-white hover:border-charcoal flex items-center justify-center gap-1"
                    >
                      <Edit3 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="px-3 border border-[#fcc] bg-[#fee] text-[#c94b4b] hover:bg-[#fcc]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProductForm
        product={editing}
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditing(null);
        }}
      />
    </>
  );
}

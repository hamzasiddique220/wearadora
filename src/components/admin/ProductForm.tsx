'use client';

import { useState, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { Product } from '@/types';
import { productService } from '@/lib/services/products';
import { useUIStore } from '@/lib/stores/ui';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import Modal from '@/components/ui/Modal';

interface ProductFormProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductForm({ product, isOpen, onClose }: ProductFormProps) {
  const showToast = useUIStore((state) => state.showToast);

  const [form, setForm] = useState({
    name: product?.name || '',
    category: product?.category || 'Necklace',
    price: product?.price || 0,
    stock: product?.stock || 0,
    image: product?.image || '',
    description: product?.description || '',
    isNew: product?.isNew || false,
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await productService.uploadImage(file);
      setForm({ ...form, image: url });
      showToast('Image uploaded');
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Upload failed', 'error');
    }
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price) {
      showToast('Name and price are required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        ...form,
        price: parseFloat(form.price.toString()) || 0,
        stock: parseInt(form.stock.toString()) || 0,
      };

      if (product?.id) {
        await productService.update(product.id, data);
        showToast('Product updated');
      } else {
        await productService.create(data);
        showToast('Product added');
      }
      onClose();
    } catch (error) {
      showToast('Something went wrong', 'error');
    }
    setSubmitting(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl">
            {product ? 'Edit Product' : 'New Product'}
          </h2>
          <button onClick={onClose} aria-label="Close">
            <X size={22} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
              Product Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
              placeholder="e.g. Diamond Necklace"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input-field"
              >
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
                Price (Rs.) *
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: parseFloat(e.target.value) || 0 })
                }
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
                Stock
              </label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) =>
                  setForm({ ...form, stock: parseInt(e.target.value) || 0 })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
                Mark as New
              </label>
              <label className="flex items-center gap-2 mt-3">
                <input
                  type="checkbox"
                  checked={form.isNew}
                  onChange={(e) => setForm({ ...form, isNew: e.target.checked })}
                />
                <span className="text-sm">Show &ldquo;New&rdquo; badge</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
              Product Image
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="input-field flex-1"
                placeholder="Image URL"
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="btn-outline px-4 whitespace-nowrap flex items-center gap-2"
              >
                <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload'}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            {form.image && (
              <div className="aspect-video bg-sand overflow-hidden mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field min-h-[100px] resize-none"
              placeholder="Describe this product..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-outline flex-1">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary flex-[2] disabled:opacity-50"
          >
            {submitting ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

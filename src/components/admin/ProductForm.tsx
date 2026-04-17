'use client';

import { useState, useRef, useMemo } from 'react';
import { X, Upload, Check, Plus, Trash2, Star } from 'lucide-react';
import { Product } from '@/types';
import { productService } from '@/lib/services/products';
import { useUIStore } from '@/lib/stores/ui';
import {
  PRODUCT_CATEGORIES,
  SLIPPER_SIZES,
  DEFAULT_SLIPPER_COLORS,
  COLOR_HEX,
  getProductType,
} from '@/lib/constants';
import Modal from '@/components/ui/Modal';

interface ProductFormProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductForm({ product, isOpen, onClose }: ProductFormProps) {
  const showToast = useUIStore((state) => state.showToast);

  const initialGallery = useMemo(() => {
    const list = [
      ...(product?.images || []),
      ...(product?.image ? [product.image] : []),
    ];
    return Array.from(new Set(list.filter(Boolean)));
  }, [product]);

  const [form, setForm] = useState({
    name: product?.name || '',
    category: product?.category || 'Necklace',
    price: product?.price !== undefined ? String(product.price) : '',
    originalPrice:
      product?.originalPrice !== undefined ? String(product.originalPrice) : '',
    stock: product?.stock !== undefined ? String(product.stock) : '',
    description: product?.description || '',
    isNew: product?.isNew || false,
    sizes: product?.sizes || [],
    colors: product?.colors || [],
  });
  const [images, setImages] = useState<string[]>(initialGallery);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [customColor, setCustomColor] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const productType = useMemo(() => getProductType(form.category), [form.category]);
  const isSlippers = productType === 'slippers';

  const toggleSize = (size: number) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(size)
        ? f.sizes.filter((s) => s !== size)
        : [...f.sizes, size].sort((a, b) => a - b),
    }));
  };

  const toggleColor = (color: string) => {
    setForm((f) => ({
      ...f,
      colors: f.colors.includes(color)
        ? f.colors.filter((c) => c !== color)
        : [...f.colors, color],
    }));
  };

  const addCustomColor = () => {
    const c = customColor.trim();
    if (!c || form.colors.includes(c)) return;
    setForm((f) => ({ ...f, colors: [...f.colors, c] }));
    setCustomColor('');
  };

  const addImageUrl = () => {
    const url = newImageUrl.trim();
    if (!url || images.includes(url)) return;
    setImages((list) => [...list, url]);
    setNewImageUrl('');
  };

  const removeImage = (url: string) => {
    setImages((list) => list.filter((i) => i !== url));
  };

  const makePrimary = (url: string) => {
    setImages((list) => [url, ...list.filter((i) => i !== url)]);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const url = await productService.uploadImage(file);
        uploaded.push(url);
      }
      setImages((list) => [...list, ...uploaded.filter((u) => !list.includes(u))]);
      showToast(
        uploaded.length > 1
          ? `${uploaded.length} images uploaded`
          : 'Image uploaded'
      );
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Upload failed', 'error');
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async () => {
    const priceNum = parseFloat(form.price);
    if (!form.name.trim() || !form.price || isNaN(priceNum) || priceNum <= 0) {
      showToast('Name and valid price are required', 'error');
      return;
    }

    if (isSlippers && form.sizes.length === 0) {
      showToast('Select at least one size for slippers', 'error');
      return;
    }

    if (images.length === 0) {
      showToast('Add at least one product image', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const originalPriceNum = form.originalPrice ? parseFloat(form.originalPrice) : 0;
      const [primary, ...rest] = images;
      const data = {
        name: form.name.trim(),
        category: form.category,
        productType,
        price: priceNum,
        originalPrice: originalPriceNum > priceNum ? originalPriceNum : 0,
        stock: form.stock ? parseInt(form.stock) || 0 : 0,
        image: primary,
        images: rest.length > 0 ? [primary, ...rest] : [primary],
        description: form.description,
        isNew: form.isNew,
        sizes: isSlippers ? form.sizes : [],
        colors: isSlippers ? form.colors : [],
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
      console.error('Save error:', error);
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
                <optgroup label="Jewelry">
                  {PRODUCT_CATEGORIES.filter(
                    (c) => getProductType(c) === 'jewelry'
                  ).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Slippers">
                  {PRODUCT_CATEGORIES.filter(
                    (c) => getProductType(c) === 'slippers'
                  ).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
                Price (Rs.) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="input-field"
                placeholder="e.g. 2500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
                Original Price (optional)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={form.originalPrice}
                onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                className="input-field"
                placeholder="For discount display"
              />
            </div>
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
                Stock
              </label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="input-field"
                placeholder="e.g. 10"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isNew}
                onChange={(e) => setForm({ ...form, isNew: e.target.checked })}
              />
              <span className="text-sm">Show &ldquo;New&rdquo; badge on product</span>
            </label>
          </div>

          {isSlippers && (
            <div className="bg-sand/40 border border-stone p-4 space-y-4">
              <div className="text-[10px] tracking-[0.3em] uppercase text-bronze font-medium">
                ✦ Slipper Variants
              </div>

              <div>
                <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
                  Available Sizes *
                </label>
                <div className="flex flex-wrap gap-2">
                  {SLIPPER_SIZES.map((size) => {
                    const selected = form.sizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`w-11 h-11 border text-sm font-medium transition-all ${
                          selected
                            ? 'bg-charcoal text-cream border-charcoal'
                            : 'bg-white text-charcoal border-stone hover:border-charcoal'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
                  Available Colors
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {DEFAULT_SLIPPER_COLORS.map((color) => {
                    const selected = form.colors.includes(color);
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => toggleColor(color)}
                        className={`flex items-center gap-2 px-3 py-2 border text-xs transition-all ${
                          selected
                            ? 'bg-charcoal text-cream border-charcoal'
                            : 'bg-white border-stone hover:border-charcoal'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 border border-stone"
                          style={{ backgroundColor: COLOR_HEX[color] || '#ccc' }}
                        />
                        {color}
                        {selected && <Check size={12} />}
                      </button>
                    );
                  })}
                </div>
                {form.colors.filter(
                  (c) => !(DEFAULT_SLIPPER_COLORS as readonly string[]).includes(c)
                ).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.colors
                      .filter(
                        (c) =>
                          !(DEFAULT_SLIPPER_COLORS as readonly string[]).includes(c)
                      )
                      .map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => toggleColor(color)}
                          className="flex items-center gap-2 px-3 py-2 border border-bronze bg-bronze/10 text-xs"
                        >
                          {color} ✕
                        </button>
                      ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomColor();
                      }
                    }}
                    placeholder="Custom color (e.g. Emerald)"
                    className="input-field flex-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={addCustomColor}
                    className="btn-outline px-4 text-xs whitespace-nowrap"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] tracking-[0.3em] uppercase text-mocha">
                Product Gallery *
              </label>
              <span className="text-[10px] text-mocha">
                {images.length} image{images.length === 1 ? '' : 's'} • first = cover
              </span>
            </div>

            <div className="flex gap-2 mb-3">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addImageUrl();
                  }
                }}
                className="input-field flex-1"
                placeholder="Paste image URL and press Enter"
              />
              <button
                type="button"
                onClick={addImageUrl}
                disabled={!newImageUrl.trim()}
                className="btn-outline px-4 text-xs whitespace-nowrap flex items-center gap-2 disabled:opacity-40"
              >
                <Plus size={14} /> Add
              </button>
              <button
                type="button"
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
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {images.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {images.map((url, i) => (
                  <div
                    key={url}
                    className="relative aspect-square bg-sand overflow-hidden group border border-stone"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Gallery ${i + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {i === 0 && (
                      <div className="absolute top-1 left-1 bg-bronze text-white text-[8px] tracking-[0.2em] uppercase px-1.5 py-0.5 flex items-center gap-1">
                        <Star size={8} fill="white" /> Cover
                      </div>
                    )}

                    <div className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                      {i !== 0 && (
                        <button
                          type="button"
                          onClick={() => makePrimary(url)}
                          className="text-white text-[9px] tracking-[0.15em] uppercase px-2 py-1 bg-white/10 hover:bg-white/25"
                        >
                          Set as Cover
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className="text-white text-[9px] tracking-[0.15em] uppercase px-2 py-1 bg-[#c94b4b]/80 hover:bg-[#c94b4b] flex items-center gap-1"
                      >
                        <Trash2 size={10} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="aspect-video bg-sand/40 border border-dashed border-stone flex items-center justify-center text-sm text-mocha">
                No images yet — upload or paste an image URL
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

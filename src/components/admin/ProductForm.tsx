'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { X, Upload, Check, Plus, Trash2, Star, Sparkles } from 'lucide-react';
import { Product } from '@/types';
import { sluggify } from '@/lib/utils';
import { productService } from '@/lib/services/products';
import { useUIStore } from '@/lib/stores/ui';
import {
  PRODUCT_CATEGORIES,
  SLIPPER_SIZES,
  DEFAULT_SLIPPER_COLORS,
  COLOR_HEX,
  getProductType,
} from '@/lib/constants';
import {
  variantKey,
  sizesForColor,
  stockForVariant,
  totalVariantStock,
} from '@/lib/variants';
import Modal from '@/components/ui/Modal';

interface ProductFormProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

function toVariantStockStrings(
  source: Record<string, number> | undefined
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(source || {})) out[k] = String(v);
  return out;
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

  const buildInitial = (p?: Product | null) => ({
    name: p?.name || '',
    sku: p?.sku || '',
    tag: p?.tag || '',
    category: p?.category || 'Necklace',
    price: p?.price !== undefined ? String(p.price) : '',
    originalPrice:
      p?.originalPrice !== undefined && p.originalPrice > 0
        ? String(p.originalPrice)
        : '',
    stock: p?.stock !== undefined ? String(p.stock) : '',
    description: p?.description || '',
    isNew: p?.isNew || false,
    sizes: p?.sizes ? [...p.sizes] : ([] as number[]),
    colors: p?.colors ? [...p.colors] : ([] as string[]),
  });

  const [form, setForm] = useState(() => buildInitial(product));
  const [images, setImages] = useState<string[]>(initialGallery);
  const [slideImages, setSlideImages] = useState<string[]>(
    () => product?.slideImages || []
  );
  const [colorImages, setColorImages] = useState<Record<string, string>>(
    () => product?.colorImages || {}
  );
  // Held as raw strings (not numbers) while editing, so the input can be
  // cleared to empty without immediately snapping back to "0" — only
  // coerced to numbers on submit.
  const [variantStock, setVariantStock] = useState<Record<string, string>>(
    () => toVariantStockStrings(product?.variantStock)
  );
  const [newImageUrl, setNewImageUrl] = useState('');
  const [customColor, setCustomColor] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Re-sync form whenever the modal opens or the product being edited changes
  useEffect(() => {
    if (!isOpen) return;
    setForm(buildInitial(product));
    setImages(initialGallery);
    setSlideImages(product?.slideImages || []);
    setColorImages(product?.colorImages || {});
    setVariantStock(toVariantStockStrings(product?.variantStock));
    setNewImageUrl('');
    setCustomColor('');
  }, [isOpen, product, initialGallery]);

  const setImageForColor = (color: string, url: string) => {
    setColorImages((map) => {
      const next = { ...map };
      if (!url) {
        delete next[color];
      } else {
        next[color] = url;
      }
      return next;
    });
  };

  const toggleSlide = (url: string) => {
    setSlideImages((list) =>
      list.includes(url) ? list.filter((u) => u !== url) : [...list, url]
    );
  };

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
    setForm((f) => {
      const isRemoving = f.colors.includes(color);
      if (isRemoving) {
        setColorImages((map) => {
          if (!map[color]) return map;
          const next = { ...map };
          delete next[color];
          return next;
        });
        setVariantStock((map) => {
          const prefix = `${color}__`;
          const next: Record<string, string> = {};
          for (const [k, v] of Object.entries(map)) {
            if (!k.startsWith(prefix)) next[k] = v;
          }
          return next;
        });
      }
      return {
        ...f,
        colors: isRemoving
          ? f.colors.filter((c) => c !== color)
          : [...f.colors, color],
      };
    });
  };

  const toggleVariantSize = (color: string, size: number) => {
    const key = variantKey(color, size);
    setVariantStock((map) => {
      if (key in map) {
        const next = { ...map };
        delete next[key];
        return next;
      }
      return { ...map, [key]: '0' };
    });
  };

  // Stores whatever was typed as-is (including a transient empty string) so
  // the field can be cleared and retyped — coerced to a real number only on
  // submit (see handleSubmit). Coercing on every keystroke was the bug:
  // deleting "0" produced "", which immediately parsed back to 0 and the
  // controlled input snapped back before a new digit could be typed.
  const setVariantQty = (color: string, size: number, raw: string) => {
    const key = variantKey(color, size);
    setVariantStock((map) => ({ ...map, [key]: raw }));
  };

  const variantTotal = useMemo(() => totalVariantStock(variantStock), [variantStock]);

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
    setSlideImages((list) => list.filter((i) => i !== url));
    setColorImages((map) => {
      const next: Record<string, string> = {};
      for (const [c, u] of Object.entries(map)) {
        if (u !== url) next[c] = u;
      }
      return next;
    });
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

    const usesVariantStock = isSlippers && form.colors.length > 0;

    if (isSlippers) {
      if (usesVariantStock) {
        const colorsWithNoSizes = form.colors.filter(
          (c) => sizesForColor(variantStock, c).length === 0
        );
        if (colorsWithNoSizes.length > 0) {
          showToast(
            `Add at least one size for: ${colorsWithNoSizes.join(', ')}`,
            'error'
          );
          return;
        }
      } else if (form.sizes.length === 0) {
        showToast('Select at least one size for slippers', 'error');
        return;
      }
    }

    if (images.length === 0) {
      showToast('Add at least one product image', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const originalPriceNum = form.originalPrice ? parseFloat(form.originalPrice) : 0;
      const [primary, ...rest] = images;
      const validSlides = slideImages.filter((u) => images.includes(u));
      const validColorImages: Record<string, string> = {};
      if (isSlippers) {
        for (const c of form.colors) {
          const url = colorImages[c];
          if (url && images.includes(url)) {
            validColorImages[c] = url;
          }
        }
      }
      // Coerce the in-progress string values to real numbers only now —
      // during editing they're kept as raw strings (see setVariantQty).
      const finalVariantStock: Record<string, number> = {};
      for (const [k, v] of Object.entries(variantStock)) {
        finalVariantStock[k] = Math.max(0, parseInt(v, 10) || 0);
      }

      const trimmedName = form.name.trim();
      const data = {
        name: trimmedName,
        slug: product?.slug?.trim() || sluggify(trimmedName),
        sku: form.sku.trim(),
        tag: form.tag.trim(),
        category: form.category,
        productType,
        price: priceNum,
        originalPrice: originalPriceNum > priceNum ? originalPriceNum : 0,
        stock: usesVariantStock
          ? totalVariantStock(finalVariantStock)
          : form.stock
            ? parseInt(form.stock) || 0
            : 0,
        image: primary,
        images: rest.length > 0 ? [primary, ...rest] : [primary],
        slideImages: validSlides,
        colorImages: validColorImages,
        description: form.description,
        isNew: form.isNew,
        sizes: usesVariantStock ? [] : isSlippers ? form.sizes : [],
        colors: isSlippers ? form.colors : [],
        variantStock: usesVariantStock ? finalVariantStock : {},
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
                SKU (Identifier)
              </label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="input-field font-mono text-sm"
                placeholder="e.g. WA-1-Black"
              />
              <div className="text-[10px] text-mocha mt-1">
                Unique code for inventory tracking
              </div>
            </div>
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
                Tag (Optional)
              </label>
              <input
                type="text"
                value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value })}
                className="input-field text-sm"
                placeholder="e.g. Training, Slider, Bestseller"
              />
            </div>
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
              {isSlippers && form.colors.length > 0 ? (
                <div className="input-field bg-sand/40 text-mocha cursor-not-allowed flex items-center justify-between">
                  <span className="text-charcoal font-medium">{variantTotal}</span>
                  <span className="text-[10px]">auto — from sizes below</span>
                </div>
              ) : (
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="input-field"
                  placeholder="e.g. 10"
                />
              )}
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

              {form.colors.length === 0 && (
                <div>
                  <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
                    Available Sizes *
                  </label>
                  <div className="text-[11px] text-mocha mb-2">
                    Add a color below to set sizes + stock per color instead.
                  </div>
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
              )}

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

              {form.colors.length > 0 && (
                <div>
                  <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
                    Sizes &amp; Stock per Color *
                  </label>
                  <div className="text-[11px] text-mocha mb-3">
                    Har color ke liye available sizes toggle karein aur unka stock
                    number set karein. Customer ko sirf wahi sizes dikhengi jo
                    yahan defined hain — total Stock upar automatically calculate
                    hoga.
                  </div>
                  <div className="space-y-3">
                    {form.colors.map((color) => {
                      const colorSizes = sizesForColor(variantStock, color);
                      const colorTotal = colorSizes.reduce(
                        (sum, s) => sum + stockForVariant(variantStock, color, s),
                        0
                      );
                      return (
                        <div key={color} className="bg-white border border-stone p-3">
                          <div className="flex items-center gap-2 mb-2.5">
                            <span
                              className="w-4 h-4 rounded-full border border-stone shrink-0"
                              style={{ backgroundColor: COLOR_HEX[color] || '#ccc' }}
                            />
                            <span className="text-xs font-medium text-charcoal">
                              {color}
                            </span>
                            <span className="text-[10px] text-mocha ml-auto">
                              {colorSizes.length === 0
                                ? 'No sizes yet'
                                : `${colorSizes.length} size${colorSizes.length === 1 ? '' : 's'} • ${colorTotal} in stock`}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {SLIPPER_SIZES.map((size) => {
                              const key = variantKey(color, size);
                              const active = key in variantStock;
                              return (
                                <div
                                  key={size}
                                  className={`flex items-center border ${
                                    active
                                      ? 'border-bronze bg-bronze/5'
                                      : 'border-stone bg-white'
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => toggleVariantSize(color, size)}
                                    className={`w-9 h-9 text-xs font-medium transition-colors ${
                                      active
                                        ? 'text-charcoal'
                                        : 'text-mocha hover:text-charcoal'
                                    }`}
                                  >
                                    {size}
                                  </button>
                                  {active && (
                                    <input
                                      type="number"
                                      min="0"
                                      value={variantStock[key] ?? ''}
                                      onChange={(e) =>
                                        setVariantQty(color, size, e.target.value)
                                      }
                                      onFocus={(e) => e.target.select()}
                                      className="w-14 h-9 border-l border-bronze/40 text-xs px-1.5"
                                      aria-label={`Stock for ${color} size ${size}`}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {form.colors.length > 0 && (
                <div>
                  <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
                    Image per color (optional)
                  </label>
                  <div className="text-[11px] text-mocha mb-3">
                    Pick one gallery image for each color. Customer dekh kar jab
                    color select karega to wahi image show hogi (cart mein bhi).
                  </div>
                  {images.length === 0 ? (
                    <div className="text-[11px] text-mocha italic bg-white border border-stone p-3">
                      Gallery mein pehle images add karein, phir yahan assign hongi.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {form.colors.map((color) => {
                        const assigned = colorImages[color];
                        return (
                          <div
                            key={color}
                            className="bg-white border border-stone p-3"
                          >
                            <div className="flex items-center justify-between mb-2 gap-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-4 h-4 rounded-full border border-stone"
                                  style={{
                                    backgroundColor: COLOR_HEX[color] || '#ccc',
                                  }}
                                />
                                <span className="text-xs font-medium text-charcoal">
                                  {color}
                                </span>
                              </div>
                              {assigned && (
                                <button
                                  type="button"
                                  onClick={() => setImageForColor(color, '')}
                                  className="text-[10px] tracking-[0.15em] uppercase text-[#c94b4b] hover:underline"
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                              {images.map((url, i) => {
                                const isAssigned = assigned === url;
                                return (
                                  <button
                                    key={url}
                                    type="button"
                                    onClick={() => setImageForColor(color, url)}
                                    className={`relative shrink-0 w-14 h-14 overflow-hidden border transition-all ${
                                      isAssigned
                                        ? 'border-bronze ring-2 ring-bronze'
                                        : 'border-stone hover:border-charcoal'
                                    }`}
                                    aria-label={`Assign image ${i + 1} to ${color}`}
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={url}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                    {isAssigned && (
                                      <span className="absolute inset-0 bg-bronze/30 flex items-center justify-center">
                                        <Check size={14} className="text-white" />
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] tracking-[0.3em] uppercase text-mocha">
                Product Gallery *
              </label>
              <span className="text-[10px] text-mocha">
                {images.length} image{images.length === 1 ? '' : 's'} • first = cover •{' '}
                {slideImages.length} on home slider
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
                {images.map((url, i) => {
                  const isSlide = slideImages.includes(url);
                  return (
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

                      <div className="absolute top-1 left-1 flex flex-col gap-1">
                        {i === 0 && (
                          <div className="bg-bronze text-white text-[8px] tracking-[0.2em] uppercase px-1.5 py-0.5 flex items-center gap-1">
                            <Star size={8} fill="white" /> Cover
                          </div>
                        )}
                        {isSlide && (
                          <div className="bg-charcoal text-cream text-[8px] tracking-[0.2em] uppercase px-1.5 py-0.5 flex items-center gap-1">
                            <Sparkles size={8} /> Slide
                          </div>
                        )}
                      </div>

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
                          onClick={() => toggleSlide(url)}
                          className={`text-white text-[9px] tracking-[0.15em] uppercase px-2 py-1 flex items-center gap-1 ${
                            isSlide
                              ? 'bg-bronze/80 hover:bg-bronze'
                              : 'bg-white/10 hover:bg-white/25'
                          }`}
                        >
                          <Sparkles size={10} />
                          {isSlide ? 'Remove Slide' : 'Set as Slide'}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(url)}
                          className="text-white text-[9px] tracking-[0.15em] uppercase px-2 py-1 bg-[#c94b4b]/80 hover:bg-[#c94b4b] flex items-center gap-1"
                        >
                          <Trash2 size={10} /> Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
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

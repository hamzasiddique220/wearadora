'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Upload, Trash2, Check } from 'lucide-react';
import { Review, ReviewStatus } from '@/types';
import { reviewService } from '@/lib/services/reviews';
import { uploadAdminImage } from '@/lib/services/cloudinaryUpload';
import { useProducts } from '@/hooks/useProducts';
import { useUIStore } from '@/lib/stores/ui';
import StarRating from '@/components/ui/StarRating';
import Modal from '@/components/ui/Modal';

interface AdminReviewFormProps {
  review?: Review | null;
  isOpen: boolean;
  onClose: () => void;
}

const STATUSES: ReviewStatus[] = ['pending', 'approved', 'rejected'];

export default function AdminReviewForm({ review, isOpen, onClose }: AdminReviewFormProps) {
  const { products } = useProducts();
  const showToast = useUIStore((state) => state.showToast);

  const buildInitial = (r?: Review | null) => ({
    productId: r?.productId || '',
    reviewerName: r?.reviewerName || '',
    reviewerEmail: r?.reviewerEmail || '',
    rating: r?.rating || 5,
    comment: r?.comment || '',
    status: r?.status || ('approved' as ReviewStatus),
    verified: r?.verified || false,
    featured: r?.featured || false,
  });

  const [form, setForm] = useState(() => buildInitial(review));
  const [images, setImages] = useState<string[]>(review?.images || []);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setForm(buildInitial(review));
    setImages(review?.images || []);
  }, [isOpen, review]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 5 * 1024 * 1024) {
          showToast(`${file.name} is over 5MB`, 'error');
          continue;
        }
        uploaded.push(await uploadAdminImage(file, 'reviews'));
      }
      setImages((list) => [...list, ...uploaded]);
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Upload failed', 'error');
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeImage = (url: string) => {
    setImages((list) => list.filter((i) => i !== url));
  };

  const handleSubmit = async () => {
    const product = products.find((p) => p.id === form.productId);
    if (!product) {
      showToast('Please select a product', 'error');
      return;
    }
    if (!form.reviewerName.trim() || form.reviewerName.trim().length < 2) {
      showToast('Reviewer name is required', 'error');
      return;
    }
    if (form.rating < 1 || form.rating > 5) {
      showToast('Rating must be between 1 and 5', 'error');
      return;
    }
    const trimmedComment = form.comment.trim();
    if (trimmedComment.length < 10) {
      showToast('Review text must be at least 10 characters', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        productId: product.id,
        productName: product.name,
        reviewerName: form.reviewerName.trim(),
        // '' clears it; reviewService writes it to reviewPrivate, not the review.
        reviewerEmail: form.reviewerEmail.trim(),
        rating: form.rating,
        comment: trimmedComment,
        images,
        status: form.status,
        verified: form.verified,
        featured: form.featured,
        source: 'admin' as const,
      };

      if (review?.id) {
        await reviewService.update(review.id, data);
        showToast('Review updated');
      } else {
        await reviewService.create(data);
        showToast('Review added');
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
          <h2 className="font-serif text-2xl">{review ? 'Edit Review' : 'New Review'}</h2>
          <button onClick={onClose} aria-label="Close">
            <X size={22} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
              Product *
            </label>
            <select
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              className="input-field"
            >
              <option value="">Select a product…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
                Reviewer Name *
              </label>
              <input
                type="text"
                value={form.reviewerName}
                onChange={(e) => setForm({ ...form, reviewerName: e.target.value })}
                className="input-field"
                placeholder="e.g. Ayesha K."
              />
            </div>
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
                Email (optional)
              </label>
              <input
                type="email"
                value={form.reviewerEmail}
                onChange={(e) => setForm({ ...form, reviewerEmail: e.target.value })}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
              Rating *
            </label>
            <StarRating
              value={form.rating}
              onChange={(rating) => setForm({ ...form, rating })}
              size={24}
            />
          </div>

          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
              Review Text *
            </label>
            <textarea
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              className="input-field min-h-[100px] resize-none"
              placeholder="What did the customer say?"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] tracking-[0.3em] uppercase text-mocha">
                Photos
              </label>
              <span className="text-[10px] text-mocha">{images.length} image{images.length === 1 ? '' : 's'}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {images.map((url) => (
                <div
                  key={url}
                  className="relative w-16 h-16 border border-stone overflow-hidden group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-16 h-16 border border-dashed border-stone flex flex-col items-center justify-center gap-1 text-mocha hover:border-bronze hover:text-bronze transition-colors"
              >
                <Upload size={14} />
                <span className="text-[9px]">{uploading ? '...' : 'Upload'}</span>
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as ReviewStatus })
                }
                className="input-field"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col justify-center gap-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={form.verified}
                  onChange={(e) => setForm({ ...form, verified: e.target.checked })}
                />
                Verified purchase
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                />
                Featured
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-outline flex-1">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary flex-[2] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? 'Saving...' : review ? 'Update Review' : 'Add Review'}
            {!submitting && <Check size={14} />}
          </button>
        </div>
      </div>
    </Modal>
  );
}

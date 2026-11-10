'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Upload, Trash2, Loader2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import StarRating from '@/components/ui/StarRating';
import { uploadReviewImage } from '@/lib/services/cloudinaryUpload';
import { reviewService } from '@/lib/services/reviews';
import { useUIStore } from '@/lib/stores/ui';
import { storage } from '@/lib/utils';

interface ReviewFormProps {
  productId: string;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
}

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const COMMENT_MIN = 10;
const COMMENT_MAX = 2000;
const REMEMBER_KEY = 'wearadora_reviewer_info';

interface ImageSlot {
  previewUrl: string;
  file: File;
  uploadedUrl?: string;
  uploading: boolean;
  error?: string;
}

export default function ReviewForm({
  productId,
  productName,
  isOpen,
  onClose,
}: ReviewFormProps) {
  const showToast = useUIStore((state) => state.showToast);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [slots, setSlots] = useState<ImageSlot[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const remembered = storage.get<{ name: string; email: string }>(REMEMBER_KEY, {
      name: '',
      email: '',
    });
    setName(remembered.name);
    setEmail(remembered.email);
    setRating(0);
    setComment('');
    setSlots([]);
    setErrors({});
  }, [isOpen]);

  const addFiles = async (files: FileList) => {
    const room = MAX_IMAGES - slots.length;
    if (room <= 0) {
      showToast(`You can attach up to ${MAX_IMAGES} photos`, 'error');
      return;
    }
    const picked = Array.from(files).slice(0, room);
    const newSlots: ImageSlot[] = [];

    for (const file of picked) {
      if (!file.type.startsWith('image/')) {
        showToast(`${file.name} isn't an image`, 'error');
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        showToast(`${file.name} is over 5MB`, 'error');
        continue;
      }
      newSlots.push({
        previewUrl: URL.createObjectURL(file),
        file,
        uploading: true,
      });
    }
    if (newSlots.length === 0) return;

    setSlots((s) => [...s, ...newSlots]);

    await Promise.all(
      newSlots.map(async (slot) => {
        try {
          const url = await uploadReviewImage(slot.file);
          setSlots((s) =>
            s.map((x) =>
              x.previewUrl === slot.previewUrl
                ? { ...x, uploadedUrl: url, uploading: false }
                : x
            )
          );
        } catch (err) {
          console.error('Review image upload failed:', err);
          setSlots((s) =>
            s.map((x) =>
              x.previewUrl === slot.previewUrl
                ? { ...x, uploading: false, error: 'Upload failed' }
                : x
            )
          );
        }
      })
    );
  };

  const removeSlot = (previewUrl: string) => {
    setSlots((s) => {
      const target = s.find((x) => x.previewUrl === previewUrl);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return s.filter((x) => x.previewUrl !== previewUrl);
    });
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) {
      next.name = 'Please enter your name';
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = 'That email looks invalid';
    }
    if (rating < 1 || rating > 5) {
      next.rating = 'Please select a star rating';
    }
    const trimmedComment = comment.trim();
    if (trimmedComment.length < COMMENT_MIN) {
      next.comment = `Please write at least ${COMMENT_MIN} characters`;
    } else if (trimmedComment.length > COMMENT_MAX) {
      next.comment = `Please keep it under ${COMMENT_MAX} characters`;
    }
    if (slots.some((s) => s.uploading)) {
      next.images = 'Please wait for photos to finish uploading';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!validate()) {
      showToast('Please fix the highlighted fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const images = slots
        .map((s) => s.uploadedUrl)
        .filter((u): u is string => !!u);

      await reviewService.create({
        productId,
        productName,
        reviewerName: name.trim(),
        reviewerEmail: email.trim() || undefined,
        rating,
        comment: comment.trim(),
        images,
        status: 'pending',
        source: 'customer',
      });

      storage.set(REMEMBER_KEY, { name: name.trim(), email: email.trim() });
      showToast('Thank you! Your review will appear once approved.');
      slots.forEach((s) => URL.revokeObjectURL(s.previewUrl));
      onClose();
    } catch (err) {
      console.error('Review submit failed:', err);
      showToast('Something went wrong — please try again', 'error');
    }
    setSubmitting(false);
  };

  const uploadingCount = slots.filter((s) => s.uploading).length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl">
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-serif text-2xl">Write a Review</h2>
          <button onClick={onClose} aria-label="Close">
            <X size={22} />
          </button>
        </div>
        <p className="text-xs text-mocha mb-6 truncate">{productName}</p>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
              Your Rating *
            </label>
            <StarRating value={rating} onChange={setRating} size={26} />
            {errors.rating && (
              <p className="text-[11px] text-[#c94b4b] mt-1.5">{errors.rating}</p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
                Your Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="e.g. Ayesha K."
              />
              {errors.name && (
                <p className="text-[11px] text-[#c94b4b] mt-1.5">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
                Email (optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-[11px] text-[#c94b4b] mt-1.5">{errors.email}</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] tracking-[0.3em] uppercase text-mocha">
                Your Review *
              </label>
              <span className="text-[10px] text-mocha">
                {comment.trim().length}/{COMMENT_MAX}
              </span>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={COMMENT_MAX}
              className="input-field min-h-[120px] resize-none"
              placeholder="Share your experience — fit, quality, how it looked, delivery..."
            />
            {errors.comment && (
              <p className="text-[11px] text-[#c94b4b] mt-1.5">{errors.comment}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] tracking-[0.3em] uppercase text-mocha">
                Add Photos (optional)
              </label>
              <span className="text-[10px] text-mocha">
                {slots.length}/{MAX_IMAGES}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {slots.map((slot) => (
                <div
                  key={slot.previewUrl}
                  className="relative w-16 h-16 md:w-20 md:h-20 border border-stone overflow-hidden shrink-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slot.previewUrl}
                    alt="Selected"
                    className="w-full h-full object-cover"
                  />
                  {slot.uploading && (
                    <div className="absolute inset-0 bg-charcoal/60 flex items-center justify-center">
                      <Loader2 size={18} className="text-white animate-spin" />
                    </div>
                  )}
                  {slot.error && (
                    <div className="absolute inset-0 bg-[#c94b4b]/80 flex items-center justify-center text-[9px] text-white text-center px-1">
                      {slot.error}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeSlot(slot.previewUrl)}
                    className="absolute top-0.5 right-0.5 bg-charcoal/70 text-white p-0.5 hover:bg-[#c94b4b]"
                    aria-label="Remove photo"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}

              {slots.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-16 h-16 md:w-20 md:h-20 border border-dashed border-stone flex flex-col items-center justify-center gap-1 text-mocha hover:border-bronze hover:text-bronze transition-colors shrink-0"
                >
                  <Upload size={16} />
                  <span className="text-[9px]">Upload</span>
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) addFiles(e.target.files);
                  e.target.value = '';
                }}
              />
            </div>
            <p className="text-[10px] text-mocha mt-1.5">
              Up to {MAX_IMAGES} photos, 5MB each — JPG, PNG or WEBP
            </p>
            {errors.images && (
              <p className="text-[11px] text-[#c94b4b] mt-1">{errors.images}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-outline flex-1">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || uploadingCount > 0}
            className="btn-primary flex-[2] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {submitting
              ? 'Submitting...'
              : uploadingCount > 0
                ? 'Uploading photos...'
                : 'Submit Review'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

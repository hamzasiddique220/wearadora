'use client';

import { useRef, useState } from 'react';
import { Upload, X, ImageOff } from 'lucide-react';
import { siteSettingsService } from '@/lib/services/siteSettings';
import { useUIStore } from '@/lib/stores/ui';

interface ImageFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  className?: string;
}

export default function ImageField({
  label,
  value,
  onChange,
  hint,
  className = '',
}: ImageFieldProps) {
  const showToast = useUIStore((s) => s.showToast);
  const [uploading, setUploading] = useState(false);
  const [errored, setErrored] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await siteSettingsService.uploadImage(file);
      onChange(url);
      setErrored(false);
      showToast('Image uploaded');
    } catch (err) {
      console.error(err);
      showToast('Upload failed', 'error');
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className={className}>
      <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
        {label}
      </label>

      <div className="flex gap-3 items-start">
        <div className="relative w-24 h-24 shrink-0 border border-stone bg-sand/40 overflow-hidden">
          {value && !errored ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt={label}
              onError={() => setErrored(true)}
              onLoad={() => setErrored(false)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-mocha/60">
              <ImageOff size={20} />
            </div>
          )}
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setErrored(false);
              }}
              className="absolute top-1 right-1 w-6 h-6 bg-charcoal/80 text-white flex items-center justify-center hover:bg-[#c94b4b]"
              aria-label="Clear image"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <input
            type="url"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setErrored(false);
            }}
            placeholder="Paste image URL or upload"
            className="input-field text-xs"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="btn-outline px-3 text-[11px] flex items-center gap-1.5 whitespace-nowrap"
            >
              <Upload size={12} /> {uploading ? 'Uploading…' : 'Upload'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
          </div>
          {hint && <div className="text-[10px] text-mocha">{hint}</div>}
        </div>
      </div>
    </div>
  );
}

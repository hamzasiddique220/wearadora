'use client';

import { useEffect, useState } from 'react';
import { Save, Plus, Trash2, ChevronUp, ChevronDown, Sparkles, Gem } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { siteSettingsService } from '@/lib/services/siteSettings';
import { useUIStore } from '@/lib/stores/ui';
import {
  DEFAULT_HERO_SLIDES,
  DEFAULT_CATEGORY_IMAGES,
  JEWELRY_BG,
  SHOE_BG_LIGHT,
} from '@/lib/defaults/siteSettings';
import type { HeroSlideOverride, SiteSettings } from '@/types';
import ImageField from '@/components/admin/ImageField';

const CATEGORY_KEYS = Object.keys(DEFAULT_CATEGORY_IMAGES);

export default function AdminSettingsPage() {
  const { settings, loading } = useSiteSettings();
  const showToast = useUIStore((s) => s.showToast);

  const [heroSlides, setHeroSlides] = useState<HeroSlideOverride[]>([]);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [storyImage, setStoryImage] = useState('');
  const [jewelryHero, setJewelryHero] = useState({ image: '', kind: 'photo' as 'photo' | 'product' });
  const [slippersHero, setSlippersHero] = useState({ image: '', kind: 'product' as 'photo' | 'product' });
  const [jewelryEnabled, setJewelryEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (loading || hydrated) return;
    setHeroSlides(settings.heroSlides);
    setCategoryImages({ ...settings.categoryImages });
    setStoryImage(settings.storyImage);
    setJewelryHero({ image: settings.jewelryHero.image, kind: settings.jewelryHero.kind || 'photo' });
    setSlippersHero({ image: settings.slippersHero.image, kind: settings.slippersHero.kind || 'product' });
    setJewelryEnabled(settings.jewelryEnabled === true);
    setHydrated(true);
  }, [loading, hydrated, settings]);

  const updateSlide = (idx: number, patch: Partial<HeroSlideOverride>) => {
    setHeroSlides((list) =>
      list.map((s, i) => (i === idx ? { ...s, ...patch } : s))
    );
  };

  const removeSlide = (idx: number) => {
    setHeroSlides((list) => list.filter((_, i) => i !== idx));
  };

  const moveSlide = (idx: number, dir: -1 | 1) => {
    setHeroSlides((list) => {
      const next = [...list];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return next;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const addSlide = (kind: 'shoe' | 'jewel') => {
    const blank: HeroSlideOverride = {
      image: '',
      bg: kind === 'jewel' ? JEWELRY_BG : SHOE_BG_LIGHT,
      eyebrow: '✦ New Slide',
      title: 'A new',
      italic: 'beginning',
      tail: '',
      description: 'Describe this slide.',
      primaryLabel: 'Shop Now',
      primaryHref: kind === 'jewel' ? '/jewelry' : '/slippers',
      secondaryLabel: 'View All',
      secondaryHref: '/shop',
      kind,
    };
    setHeroSlides((list) => [...list, blank]);
  };

  const resetHero = () => {
    if (!window.confirm('Reset hero slides to defaults?')) return;
    setHeroSlides(DEFAULT_HERO_SLIDES);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Partial<SiteSettings> = {
        heroSlides: heroSlides.filter((s) => s.image && s.title),
        categoryImages,
        storyImage,
        jewelryHero,
        slippersHero,
        jewelryEnabled,
      };
      await siteSettingsService.save(payload);
      showToast('Site settings saved');
    } catch (err) {
      console.error(err);
      showToast('Save failed', 'error');
    }
    setSaving(false);
  };

  if (loading || !hydrated) {
    return (
      <div className="max-w-[1100px] mx-auto px-6 md:px-12 py-12 text-mocha">
        Loading settings…
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-12 py-8 pb-32">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
        <div>
          <span className="text-[10px] tracking-[0.4em] uppercase text-bronze">
            ✦ Site Content
          </span>
          <h1 className="font-serif text-4xl mt-2">Settings</h1>
          <p className="text-mocha text-sm mt-1">
            Hero slides, category tiles, page heroes — all images load from here.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={14} /> {saving ? 'Saving…' : 'Save All Changes'}
        </button>
      </div>

      {/* Storefront sections — master switches */}
      <section className="bg-white border border-stone p-5 md:p-6 mb-6">
        <h2 className="font-serif text-2xl mb-1 flex items-center gap-2">
          <Gem size={18} className="text-bronze" /> Storefront Sections
        </h2>
        <p className="text-[11px] text-mocha mb-4">
          Toggle entire collections on or off. Disabled collections are hidden
          from navigation, homepage, search, and direct page access.
        </p>

        <label
          className={`flex items-start gap-4 p-4 border cursor-pointer transition-colors ${
            jewelryEnabled
              ? 'border-bronze bg-bronze/5'
              : 'border-stone bg-sand/30'
          }`}
        >
          <input
            type="checkbox"
            checked={jewelryEnabled}
            onChange={(e) => setJewelryEnabled(e.target.checked)}
            className="mt-1 w-5 h-5 accent-bronze cursor-pointer"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-charcoal">
                Jewelry collection
              </span>
              <span
                className={`text-[9px] tracking-[0.25em] uppercase px-2 py-0.5 ${
                  jewelryEnabled
                    ? 'bg-[#2d6a4f] text-cream'
                    : 'bg-stone text-charcoal'
                }`}
              >
                {jewelryEnabled ? 'Live' : 'Hidden'}
              </span>
            </div>
            <p className="text-[12px] text-mocha mt-1 leading-relaxed">
              {jewelryEnabled
                ? 'Jewelry pages, navigation links, hero slides, and product cards are visible on the storefront.'
                : 'All jewelry surfaces are hidden from customers. Existing products remain in the admin panel and can be re-enabled anytime.'}
            </p>
            <p className="text-[11px] text-mocha/80 mt-2">
              Save changes for the toggle to take effect on the live site.
            </p>
          </div>
        </label>
      </section>

      {/* Hero slides */}
      <section className="bg-white border border-stone p-5 md:p-6 mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="font-serif text-2xl">Hero Slider</h2>
            <p className="text-[11px] text-mocha mt-1">
              These show on the homepage when no products have slide images.
              Product slides (set per-product) take priority.
            </p>
          </div>
          <button
            onClick={resetHero}
            className="text-[10px] tracking-[0.2em] uppercase text-mocha hover:text-[#c94b4b]"
          >
            Reset to defaults
          </button>
        </div>

        <div className="space-y-4">
          {heroSlides.map((s, idx) => (
            <div
              key={idx}
              className="border border-stone bg-sand/30 p-4 rounded-sm"
            >
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="bg-charcoal text-cream text-[9px] tracking-[0.2em] uppercase px-2 py-0.5">
                    Slide #{idx + 1}
                  </span>
                  <select
                    value={s.kind}
                    onChange={(e) =>
                      updateSlide(idx, { kind: e.target.value as 'shoe' | 'jewel' })
                    }
                    className="text-[10px] tracking-[0.15em] uppercase border border-stone bg-white px-2 py-1"
                  >
                    <option value="shoe">Shoe</option>
                    <option value="jewel">Jewel</option>
                  </select>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveSlide(idx, -1)}
                    disabled={idx === 0}
                    className="w-8 h-8 border border-stone bg-white flex items-center justify-center disabled:opacity-30 hover:border-charcoal"
                    aria-label="Move up"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSlide(idx, 1)}
                    disabled={idx === heroSlides.length - 1}
                    className="w-8 h-8 border border-stone bg-white flex items-center justify-center disabled:opacity-30 hover:border-charcoal"
                    aria-label="Move down"
                  >
                    <ChevronDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSlide(idx)}
                    className="w-8 h-8 border border-stone bg-white flex items-center justify-center text-[#c94b4b] hover:border-[#c94b4b]"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <ImageField
                label="Slide Image"
                value={s.image}
                onChange={(url) => updateSlide(idx, { image: url })}
                hint="Transparent PNG works best for shoes; rich photo for jewelry."
                className="mb-3"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
                    Eyebrow
                  </label>
                  <input
                    value={s.eyebrow}
                    onChange={(e) => updateSlide(idx, { eyebrow: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
                    Title (start)
                  </label>
                  <input
                    value={s.title}
                    onChange={(e) => updateSlide(idx, { title: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
                    Italic word
                  </label>
                  <input
                    value={s.italic}
                    onChange={(e) => updateSlide(idx, { italic: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
                    Tail (optional)
                  </label>
                  <input
                    value={s.tail || ''}
                    onChange={(e) => updateSlide(idx, { tail: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
                  Description
                </label>
                <textarea
                  value={s.description}
                  onChange={(e) => updateSlide(idx, { description: e.target.value })}
                  className="input-field min-h-[70px] text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
                    Primary CTA — label
                  </label>
                  <input
                    value={s.primaryLabel}
                    onChange={(e) =>
                      updateSlide(idx, { primaryLabel: e.target.value })
                    }
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
                    Primary CTA — link
                  </label>
                  <input
                    value={s.primaryHref}
                    onChange={(e) =>
                      updateSlide(idx, { primaryHref: e.target.value })
                    }
                    className="input-field text-sm font-mono"
                    placeholder="/slippers"
                  />
                </div>
                <div>
                  <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
                    Secondary CTA — label
                  </label>
                  <input
                    value={s.secondaryLabel}
                    onChange={(e) =>
                      updateSlide(idx, { secondaryLabel: e.target.value })
                    }
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
                    Secondary CTA — link
                  </label>
                  <input
                    value={s.secondaryHref}
                    onChange={(e) =>
                      updateSlide(idx, { secondaryHref: e.target.value })
                    }
                    className="input-field text-sm font-mono"
                    placeholder="/shop"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
                  Background CSS (gradient or color)
                </label>
                <input
                  value={s.bg || ''}
                  onChange={(e) => updateSlide(idx, { bg: e.target.value })}
                  placeholder="linear-gradient(135deg, #f5f1ea 0%, #e8ddc7 100%)"
                  className="input-field text-xs font-mono"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={() => addSlide('shoe')}
            className="btn-outline text-xs flex items-center gap-1.5"
          >
            <Plus size={12} /> Add Shoe Slide
          </button>
          <button
            type="button"
            onClick={() => addSlide('jewel')}
            className="btn-outline text-xs flex items-center gap-1.5"
          >
            <Plus size={12} /> Add Jewelry Slide
          </button>
        </div>
      </section>

      {/* Category tiles */}
      <section className="bg-white border border-stone p-5 md:p-6 mb-6">
        <h2 className="font-serif text-2xl mb-1">Category Tiles</h2>
        <p className="text-[11px] text-mocha mb-4">
          Used on the &ldquo;Shop by Category&rdquo; section on the homepage.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CATEGORY_KEYS.map((key) => (
            <ImageField
              key={key}
              label={key}
              value={categoryImages[key] || ''}
              onChange={(url) =>
                setCategoryImages((map) => ({ ...map, [key]: url }))
              }
            />
          ))}
        </div>
      </section>

      {/* Page heroes */}
      <section className="bg-white border border-stone p-5 md:p-6 mb-6">
        <h2 className="font-serif text-2xl mb-1">Page Heroes</h2>
        <p className="text-[11px] text-mocha mb-4">
          Banner images on /jewelry and /slippers pages.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <ImageField
              label="Jewelry Page Hero"
              value={jewelryHero.image}
              onChange={(url) => setJewelryHero((h) => ({ ...h, image: url }))}
              hint="Wide editorial photo recommended."
            />
            <div className="mt-2">
              <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-1.5 block">
                Layout
              </label>
              <select
                value={jewelryHero.kind}
                onChange={(e) =>
                  setJewelryHero((h) => ({
                    ...h,
                    kind: e.target.value as 'photo' | 'product',
                  }))
                }
                className="input-field text-sm"
              >
                <option value="photo">Photo (full-bleed banner)</option>
                <option value="product">Product (transparent on cream)</option>
              </select>
            </div>
          </div>

          <div>
            <ImageField
              label="Shoes Page Hero"
              value={slippersHero.image}
              onChange={(url) => setSlippersHero((h) => ({ ...h, image: url }))}
              hint="Transparent product PNG looks best with 'product' layout."
            />
            <div className="mt-2">
              <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-1.5 block">
                Layout
              </label>
              <select
                value={slippersHero.kind}
                onChange={(e) =>
                  setSlippersHero((h) => ({
                    ...h,
                    kind: e.target.value as 'photo' | 'product',
                  }))
                }
                className="input-field text-sm"
              >
                <option value="photo">Photo (full-bleed banner)</option>
                <option value="product">Product (transparent on cream)</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Story image */}
      <section className="bg-white border border-stone p-5 md:p-6 mb-6">
        <h2 className="font-serif text-2xl mb-1 flex items-center gap-2">
          <Sparkles size={18} className="text-bronze" /> Our Story Section
        </h2>
        <p className="text-[11px] text-mocha mb-4">
          Image shown beside the &ldquo;Crafted with passion&rdquo; story on the homepage.
        </p>
        <ImageField
          label="Story Image"
          value={storyImage}
          onChange={setStoryImage}
        />
      </section>

      <div className="sticky bottom-4 z-30 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 shadow-lg"
        >
          <Save size={14} /> {saving ? 'Saving…' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}

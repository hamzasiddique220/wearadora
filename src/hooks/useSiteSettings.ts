'use client';

import { useEffect, useState } from 'react';
import { siteSettingsService } from '@/lib/services/siteSettings';
import { mergeSettings } from '@/lib/defaults/siteSettings';
import type { SiteSettings } from '@/types';

export const useSiteSettings = () => {
  const [raw, setRaw] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = siteSettingsService.subscribe((data) => {
      setRaw(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { settings: mergeSettings(raw), raw, loading };
};

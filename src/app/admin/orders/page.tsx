'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Phone, MapPin, Trash2, Bell, BellOff, Sparkles, Calendar, X, FileText } from 'lucide-react';
import { OrderStatus } from '@/types';
import { useOrders } from '@/hooks/useOrders';
import { orderService } from '@/lib/services/orders';
import { useUIStore } from '@/lib/stores/ui';
import { formatPrice, cleanPhoneNumber } from '@/lib/utils';
import { ORDER_STATUSES } from '@/lib/constants';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import Loading from '@/components/ui/Loading';

const playOrderChime = () => {
  if (typeof window === 'undefined') return;
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + start + duration
      );
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };
    playTone(880, 0, 0.18);
    playTone(1320, 0.18, 0.22);
  } catch (e) {
    // Audio unavailable — ignore silently
  }
};

export default function AdminOrdersPage() {
  const { orders, loading } = useOrders();
  const showToast = useUIStore((state) => state.showToast);
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [datePreset, setDatePreset] = useState<
    'all' | 'today' | 'yesterday' | 'last7' | 'last30' | 'custom'
  >('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const seenIds = useRef<Set<string> | null>(null);
  const baseTitle = useRef<string>('');

  // Sync notification permission state on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;
    setNotificationsEnabled(Notification.permission === 'granted');
    baseTitle.current = document.title;
  }, []);

  // Detect new orders and trigger sound + browser notification
  useEffect(() => {
    if (loading) return;
    // First load — just record the snapshot, don't notify
    if (seenIds.current === null) {
      seenIds.current = new Set(orders.map((o) => o.id));
      return;
    }
    const fresh = orders.filter((o) => !seenIds.current!.has(o.id));
    if (fresh.length === 0) return;

    fresh.forEach((o) => seenIds.current!.add(o.id));
    setNewOrderIds((prev) => {
      const next = new Set(prev);
      fresh.forEach((o) => next.add(o.id));
      return next;
    });

    playOrderChime();

    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      fresh.forEach((o) => {
        try {
          new Notification(`New order — ${o.customer?.name || 'Customer'}`, {
            body: `${o.items?.length || 0} item${
              (o.items?.length || 0) === 1 ? '' : 's'
            } • ${formatPrice(o.total)} • ${o.customer?.phone || ''}`,
            tag: o.id,
          });
        } catch (e) {
          // Notification may fail in some contexts — ignore
        }
      });
    }
  }, [orders, loading]);

  // Update tab title with unread count
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const base = baseTitle.current || document.title;
    if (newOrderIds.size > 0) {
      document.title = `(${newOrderIds.size}) New Order${
        newOrderIds.size === 1 ? '' : 's'
      } — Admin`;
    } else {
      document.title = base;
    }
  }, [newOrderIds]);

  // Clear "new" highlight when window becomes focused
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onFocus = () => setNewOrderIds(new Set());
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const enableNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      showToast('Browser does not support notifications', 'error');
      return;
    }
    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
      showToast('Notifications already enabled');
      return;
    }
    if (Notification.permission === 'denied') {
      showToast(
        'Notifications blocked — enable from browser site settings',
        'error'
      );
      return;
    }
    const result = await Notification.requestPermission();
    if (result === 'granted') {
      setNotificationsEnabled(true);
      showToast('Notifications enabled');
      // Test ping so admin knows it works
      playOrderChime();
      try {
        new Notification('WEARADORA Admin', {
          body: 'You will be alerted here when a new order arrives.',
        });
      } catch (e) {
        // ignore
      }
    } else {
      showToast('Notification permission denied', 'error');
    }
  };

  const dateRange = useMemo(() => {
    const startOfDay = (d: Date) => {
      const x = new Date(d);
      x.setHours(0, 0, 0, 0);
      return x;
    };
    const endOfDay = (d: Date) => {
      const x = new Date(d);
      x.setHours(23, 59, 59, 999);
      return x;
    };
    const now = new Date();

    if (datePreset === 'today') {
      return { from: startOfDay(now), to: endOfDay(now) };
    }
    if (datePreset === 'yesterday') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      return { from: startOfDay(y), to: endOfDay(y) };
    }
    if (datePreset === 'last7') {
      const f = new Date(now);
      f.setDate(f.getDate() - 6);
      return { from: startOfDay(f), to: endOfDay(now) };
    }
    if (datePreset === 'last30') {
      const f = new Date(now);
      f.setDate(f.getDate() - 29);
      return { from: startOfDay(f), to: endOfDay(now) };
    }
    if (datePreset === 'custom') {
      const from = dateFrom ? startOfDay(new Date(dateFrom)) : null;
      const to = dateTo ? endOfDay(new Date(dateTo)) : null;
      return { from, to };
    }
    return { from: null, to: null };
  }, [datePreset, dateFrom, dateTo]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (filter !== 'all' && o.status !== filter) return false;
      if (dateRange.from || dateRange.to) {
        const orderTime = o.createdAt ? new Date(o.createdAt).getTime() : 0;
        if (!orderTime) return false;
        if (dateRange.from && orderTime < dateRange.from.getTime()) return false;
        if (dateRange.to && orderTime > dateRange.to.getTime()) return false;
      }
      return true;
    });
  }, [orders, filter, dateRange]);

  const clearDateFilter = () => {
    setDatePreset('all');
    setDateFrom('');
    setDateTo('');
  };

  const dateActive = datePreset !== 'all';

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    try {
      await orderService.updateStatus(id, status);
      showToast('Order updated');
    } catch (error) {
      showToast('Update failed', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      await orderService.delete(id);
      showToast('Order deleted');
    } catch (error) {
      showToast('Delete failed', 'error');
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-8">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <span className="text-[10px] tracking-[0.4em] uppercase text-bronze">
            ✦ Customer Orders
          </span>
          <h1 className="font-serif text-4xl mt-2 flex items-center gap-3 flex-wrap">
            Orders ({orders.length})
            {newOrderIds.size > 0 && (
              <span className="text-xs tracking-[0.2em] uppercase bg-bronze text-white px-2.5 py-1 rounded-full font-sans font-medium animate-pulse">
                {newOrderIds.size} new
              </span>
            )}
          </h1>
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={enableNotifications}
            className={`px-3 py-1.5 text-[10px] tracking-[0.2em] uppercase border flex items-center gap-1.5 ${
              notificationsEnabled
                ? 'bg-[#2d6a4f]/10 text-[#2d6a4f] border-[#2d6a4f]/40'
                : 'bg-white border-stone hover:border-charcoal'
            }`}
            title={
              notificationsEnabled
                ? 'Browser notifications are on'
                : 'Click to enable browser notifications'
            }
          >
            {notificationsEnabled ? (
              <>
                <Bell size={12} /> Alerts On
              </>
            ) : (
              <>
                <BellOff size={12} /> Enable Alerts
              </>
            )}
          </button>
          {(['all', ...ORDER_STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-[10px] tracking-[0.2em] uppercase border ${
                filter === s
                  ? 'bg-charcoal text-white border-charcoal'
                  : 'bg-white border-stone'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-stone p-4 mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-mocha">
          <Calendar size={14} className="text-bronze" />
          Date
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(
            [
              ['all', 'All'],
              ['today', 'Today'],
              ['yesterday', 'Yesterday'],
              ['last7', 'Last 7 days'],
              ['last30', 'Last 30 days'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                setDatePreset(key);
                setDateFrom('');
                setDateTo('');
              }}
              className={`px-3 py-1.5 text-[10px] tracking-[0.2em] uppercase border transition ${
                datePreset === key
                  ? 'bg-bronze text-white border-bronze'
                  : 'bg-white border-stone hover:border-charcoal'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setDatePreset('custom');
            }}
            className="border border-stone bg-white px-2 py-1.5 text-xs"
            aria-label="From date"
          />
          <span className="text-mocha text-xs">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setDatePreset('custom');
            }}
            className="border border-stone bg-white px-2 py-1.5 text-xs"
            aria-label="To date"
          />
          {dateActive && (
            <button
              onClick={clearDateFilter}
              className="flex items-center gap-1 text-[10px] tracking-[0.2em] uppercase text-[#c94b4b] hover:underline"
              title="Clear date filter"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>
        {dateActive && (
          <div className="w-full text-[11px] text-mocha">
            Showing <strong>{filtered.length}</strong> order
            {filtered.length === 1 ? '' : 's'} in selected date range
          </div>
        )}
      </div>

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <EmptyState message="No orders to show" />
      ) : (
        <div className="space-y-4">
          {filtered.map((o) => {
            const isNew = newOrderIds.has(o.id);
            return (
            <div
              key={o.id}
              className={`bg-white p-6 transition-shadow ${
                isNew
                  ? 'ring-2 ring-bronze shadow-lg shadow-bronze/15'
                  : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4 flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 className="font-serif text-xl">{o.customer?.name}</h3>
                    <StatusBadge status={o.status} />
                    {isNew && (
                      <span className="text-[9px] tracking-[0.2em] uppercase bg-bronze text-white px-2 py-0.5 flex items-center gap-1 animate-pulse">
                        <Sparkles size={10} /> New
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-mocha">
                    {o.orderId} • {o.dateDisplay}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-serif text-2xl">{formatPrice(o.total)}</div>
                  <div className="text-xs text-mocha">{o.items?.length} items</div>
                </div>
              </div>

              <div className="bg-cream p-4 mb-4 text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <Phone size={12} /> {o.customer?.phone}
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={12} className="mt-1 flex-shrink-0" />{' '}
                  {o.customer?.address}, {o.customer?.city}
                </div>
                {o.customer?.notes && (
                  <div className="text-bronze italic">
                    Note: {o.customer.notes}
                  </div>
                )}
              </div>

              <div className="border-t border-stone pt-4 mb-4">
                <div className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2">
                  Items
                </div>
                {o.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-1">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 flex-wrap">
                <select
                  value={o.status}
                  onChange={(e) =>
                    handleStatusChange(o.id, e.target.value as OrderStatus)
                  }
                  className="input-field flex-1 min-w-[150px] py-2"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
                <Link
                  href={`/admin/orders/${o.id}/receipt`}
                  className="px-4 py-2 border border-charcoal text-charcoal text-[10px] tracking-[0.2em] uppercase flex items-center gap-1 hover:bg-charcoal hover:text-cream transition-colors"
                >
                  <FileText size={12} /> Receipt
                </Link>
                <a
                  href={`https://wa.me/${cleanPhoneNumber(o.customer?.phone || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#25D366] text-white text-[10px] tracking-[0.2em] uppercase flex items-center gap-1"
                >
                  <Phone size={12} /> Contact
                </a>
                <button
                  onClick={() => handleDelete(o.id)}
                  className="px-3 bg-[#fee] text-[#c94b4b] border border-[#fcc]"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

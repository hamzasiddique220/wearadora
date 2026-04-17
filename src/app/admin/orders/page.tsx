'use client';

import { useState, useMemo } from 'react';
import { Phone, MapPin, Trash2 } from 'lucide-react';
import { OrderStatus } from '@/types';
import { useOrders } from '@/hooks/useOrders';
import { orderService } from '@/lib/services/orders';
import { useUIStore } from '@/lib/stores/ui';
import { formatPrice, cleanPhoneNumber } from '@/lib/utils';
import { ORDER_STATUSES } from '@/lib/constants';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import Loading from '@/components/ui/Loading';

export default function AdminOrdersPage() {
  const { orders, loading } = useOrders();
  const showToast = useUIStore((state) => state.showToast);
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

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
          <h1 className="font-serif text-4xl mt-2">Orders ({orders.length})</h1>
        </div>

        <div className="flex gap-2 flex-wrap">
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

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <EmptyState message="No orders to show" />
      ) : (
        <div className="space-y-4">
          {filtered.map((o) => (
            <div key={o.id} className="bg-white p-6">
              <div className="flex justify-between items-start mb-4 flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 className="font-serif text-xl">{o.customer?.name}</h3>
                    <StatusBadge status={o.status} />
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
          ))}
        </div>
      )}
    </div>
  );
}

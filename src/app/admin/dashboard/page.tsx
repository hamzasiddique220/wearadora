'use client';

import { DollarSign, ShoppingBag, TrendingUp, Package } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { formatPrice } from '@/lib/utils';
import StatCard from '@/components/admin/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';

export default function DashboardPage() {
  const { orders } = useOrders();
  const { products } = useProducts();

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const pendingOrders = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-8">
      <div className="mb-8">
        <span className="text-[10px] tracking-[0.4em] uppercase text-bronze">
          ✦ Overview
        </span>
        <h1 className="font-serif text-4xl mt-2">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<DollarSign size={20} />}
          label="Total Revenue"
          value={formatPrice(totalRevenue)}
        />
        <StatCard
          icon={<ShoppingBag size={20} />}
          label="Total Orders"
          value={orders.length}
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          label="Pending"
          value={pendingOrders}
          highlight
        />
        <StatCard
          icon={<Package size={20} />}
          label="Products"
          value={products.length}
        />
      </div>

      <div className="bg-white p-6">
        <h3 className="font-serif text-2xl mb-4">Recent Orders</h3>
        {orders.length === 0 ? (
          <p className="text-center py-8 text-mocha">No orders yet</p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 10).map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between p-4 bg-cream border-l-2 border-bronze flex-wrap gap-2"
              >
                <div>
                  <div className="font-medium">{o.customer?.name}</div>
                  <div className="text-xs text-mocha">
                    {o.orderId} • {o.dateDisplay}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatPrice(o.total)}</div>
                  <StatusBadge status={o.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

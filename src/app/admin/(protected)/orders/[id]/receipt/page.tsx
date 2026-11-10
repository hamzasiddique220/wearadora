'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RotateCcw } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { STORE_CONFIG } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import Loading from '@/components/ui/Loading';
import PrintReceiptButton from './PrintReceiptButton';

interface Params {
  params: { id: string };
}

interface EditableItem {
  key: string;
  name: string;
  sku?: string;
  variantLine: string;
  price: number;
  quantity: number;
}

export default function ReceiptPage({ params }: Params) {
  const { id } = params;
  const { orders, loading } = useOrders();
  const order = orders.find((o) => o.id === id);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [items, setItems] = useState<EditableItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [delivery, setDelivery] = useState(0);

  const seedFromOrder = () => {
    if (!order) return;
    setCustomerName(order.customer?.name || '');
    setCustomerPhone(order.customer?.phone || '');
    setCustomerAddress(
      [order.customer?.address, order.customer?.city]
        .filter(Boolean)
        .join(', ')
    );
    setCustomerNote(order.customer?.notes || '');
    setItems(
      order.items.map((it, i) => ({
        key: it.cartLineId || `${i}`,
        name: it.name,
        sku: it.sku,
        variantLine: [
          it.selectedSize ? `Size ${it.selectedSize}` : null,
          it.selectedColor,
        ]
          .filter(Boolean)
          .join(' · '),
        price: it.price,
        quantity: it.quantity,
      }))
    );
    const orderSubtotal =
      order.subtotal ??
      order.items.reduce((s, i) => s + i.price * i.quantity, 0);
    setDelivery(
      order.deliveryFee ??
        Math.max(0, (order.total ?? orderSubtotal) - orderSubtotal)
    );
    setDiscount(0);
  };

  useEffect(() => {
    seedFromOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id]);

  if (loading) {
    return (
      <div className="max-w-[720px] mx-auto p-10">
        <Loading message="Loading receipt..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-[720px] mx-auto p-10 text-center">
        <p className="text-mocha mb-4">
          Order not found. It may have been deleted.
        </p>
        <Link
          href="/admin/orders"
          className="text-xs tracking-[0.25em] uppercase text-bronze hover:text-charcoal"
        >
          ← Back to orders
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const grandTotal = Math.max(0, subtotal - discount + delivery);
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  const updateItem = (key: string, patch: Partial<EditableItem>) => {
    setItems((prev) =>
      prev.map((it) => (it.key === key ? { ...it, ...patch } : it))
    );
  };

  const numInput =
    'w-full text-right bg-transparent border border-stone/60 rounded-sm px-2 py-1 text-sm focus:outline-none focus:border-bronze';
  const textInput =
    'w-full bg-transparent border border-stone/60 rounded-sm px-2 py-1 text-sm focus:outline-none focus:border-bronze';

  return (
    <div className="receipt-root bg-cream min-h-screen">
      <div className="max-w-[820px] mx-auto px-6 md:px-10 py-8 md:py-12">
        <div className="no-print flex items-center justify-between mb-6 flex-wrap gap-3">
          <Link
            href="/admin/orders"
            className="text-xs tracking-[0.25em] uppercase text-mocha hover:text-bronze"
          >
            ← Back to orders
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={seedFromOrder}
              className="inline-flex items-center gap-2 border border-charcoal/60 text-charcoal px-4 py-3 text-xs tracking-[0.25em] uppercase hover:bg-charcoal hover:text-cream transition-colors"
              title="Discard edits and restore original order values"
            >
              <RotateCcw size={14} />
              Reset
            </button>
            <PrintReceiptButton />
          </div>
        </div>

        <p className="no-print text-[11px] tracking-[0.2em] uppercase text-bronze mb-3">
          ✎ All fields below are editable — change price, qty, discount or
          delivery before printing.
        </p>

        <div className="receipt-sheet bg-white border border-stone/70 p-6 md:p-10">
          <header className="receipt-header text-center pb-5 mb-6 border-b border-charcoal/15">
            <p className="font-serif text-2xl md:text-3xl tracking-[0.2em] uppercase">
              {STORE_CONFIG.name}
            </p>
            <p className="text-[10px] tracking-[0.35em] uppercase text-bronze mt-1">
              {STORE_CONFIG.tagline}
            </p>
            <p className="mt-3 text-[10px] tracking-[0.3em] uppercase text-mocha">
              ✦ Order Receipt
            </p>
          </header>

          <section className="grid sm:grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-bronze mb-1">
                Order
              </p>
              <p className="font-mono text-charcoal">{order.orderId}</p>
              <p className="text-mocha text-xs mt-1">{order.dateDisplay}</p>
              <p className="text-mocha text-xs mt-1">
                Status:{' '}
                <span className="text-charcoal capitalize font-medium">
                  {order.status}
                </span>
              </p>
            </div>
            <div className="sm:text-right space-y-1.5">
              <p className="text-[10px] tracking-[0.25em] uppercase text-bronze mb-1">
                Billed to
              </p>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer name"
                className={`${textInput} sm:text-right font-medium text-charcoal`}
              />
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Phone"
                className={`${textInput} sm:text-right text-xs`}
              />
              <textarea
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Address"
                rows={2}
                className={`${textInput} sm:text-right text-xs`}
              />
              <input
                type="text"
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="Note (optional)"
                className={`${textInput} sm:text-right text-xs italic text-bronze`}
              />
            </div>
          </section>

          <section className="mb-6">
            <p className="text-[10px] tracking-[0.25em] uppercase text-bronze mb-3">
              Items ({totalItems})
            </p>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-[10px] tracking-[0.2em] uppercase text-mocha border-b border-stone">
                  <th className="text-left py-2 font-normal">Product</th>
                  <th className="text-center py-2 font-normal w-20">Qty</th>
                  <th className="text-right py-2 font-normal w-28">Price</th>
                  <th className="text-right py-2 font-normal w-28">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.key}
                    className="border-b border-stone/50 align-top"
                  >
                    <td className="py-3 pr-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          updateItem(item.key, { name: e.target.value })
                        }
                        className={`${textInput} text-charcoal`}
                      />
                      {item.sku && (
                        <div className="text-[10px] tracking-[0.15em] uppercase text-mocha/80 mt-1">
                          SKU {item.sku}
                        </div>
                      )}
                      {item.variantLine && (
                        <div className="text-[10px] tracking-[0.15em] uppercase text-bronze mt-0.5">
                          {item.variantLine}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-1">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(item.key, {
                            quantity: Math.max(0, Number(e.target.value) || 0),
                          })
                        }
                        className={`${numInput} text-center`}
                      />
                    </td>
                    <td className="py-3 px-1">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={item.price}
                        onChange={(e) =>
                          updateItem(item.key, {
                            price: Math.max(0, Number(e.target.value) || 0),
                          })
                        }
                        className={numInput}
                      />
                    </td>
                    <td className="py-3 text-right font-medium whitespace-nowrap">
                      {formatPrice(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="ml-auto max-w-xs text-sm mb-6">
            <div className="flex justify-between items-center py-1 text-mocha">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center py-1 text-mocha gap-3">
              <span>Discount</span>
              <input
                type="number"
                min={0}
                step={1}
                value={discount}
                onChange={(e) =>
                  setDiscount(Math.max(0, Number(e.target.value) || 0))
                }
                className={`${numInput} max-w-[110px]`}
              />
            </div>
            <div className="flex justify-between items-center py-1 text-mocha gap-3">
              <span>Delivery</span>
              <input
                type="number"
                min={0}
                step={1}
                value={delivery}
                onChange={(e) =>
                  setDelivery(Math.max(0, Number(e.target.value) || 0))
                }
                className={`${numInput} max-w-[110px]`}
                placeholder="0 for FREE"
              />
            </div>
            <div className="flex justify-between py-2 mt-1 border-t border-charcoal/20 text-charcoal">
              <span className="text-[10px] tracking-[0.25em] uppercase">
                Grand Total
              </span>
              <span className="font-serif text-xl">
                {formatPrice(grandTotal)}
              </span>
            </div>
          </section>

          <footer className="receipt-footer pt-5 border-t border-charcoal/15 text-center text-[11px] text-mocha leading-relaxed">
            <p className="mb-1">
              Thank you for shopping with {STORE_CONFIG.name} —{' '}
              {STORE_CONFIG.tagline}.
            </p>
            <p className="mb-1">
              {STORE_CONFIG.siteUrl.replace('https://', '')} ·{' '}
              {STORE_CONFIG.email} · WhatsApp {STORE_CONFIG.phoneDisplay}
            </p>
            <p>
              Delivery {STORE_CONFIG.deliveryDays} · FREE on orders Rs{' '}
              {STORE_CONFIG.freeDeliveryMinTotal.toLocaleString('en-PK')}+ ·
              7-Day Exchange &amp; Return
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

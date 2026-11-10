'use client';

import { useState } from 'react';
import { X, MapPin, Loader2, Truck, CheckCircle2, Package } from 'lucide-react';
import { CustomerInfo } from '@/types';
import { useCartStore } from '@/lib/stores/cart';
import { useUIStore } from '@/lib/stores/ui';
import { orderService } from '@/lib/services/orders';
import { productService } from '@/lib/services/products';
import { generateOrderId, formatDate, formatPrice } from '@/lib/utils';
import { STORE_CONFIG, getDeliveryFee } from '@/lib/constants';
import { trackPurchase } from '@/lib/analytics';
import Modal from '@/components/ui/Modal';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getTotal());
  const itemCount = useCartStore((state) => state.getCount());
  const clearCart = useCartStore((state) => state.clearCart);
  const syncPrices = useCartStore((state) => state.syncPrices);
  const showToast = useUIStore((state) => state.showToast);

  const deliveryFee = getDeliveryFee(subtotal);
  const grandTotal = subtotal + deliveryFee;

  const [info, setInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
    mapLink: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerInfo, string>>>(
    {}
  );
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<{
    orderId: string;
    phone: string;
    total: number;
  } | null>(null);

  const handleClose = () => {
    if (placedOrder) {
      // Reset everything after success
      setPlacedOrder(null);
      setInfo({
        name: '',
        phone: '',
        address: '',
        city: '',
        notes: '',
        mapLink: '',
      });
      setErrors({});
    }
    onClose();
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!info.name.trim()) newErrors.name = 'Required';
    if (!info.phone.trim()) newErrors.phone = 'Required';
    else if (info.phone.replace(/\D/g, '').length < 10)
      newErrors.phone = 'Invalid phone number';
    if (!info.address.trim()) newErrors.address = 'Required';
    if (!info.city.trim()) newErrors.city = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const useCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      showToast('Location not supported on this device', 'error');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const link = `https://maps.google.com/?q=${latitude.toFixed(
          6
        )},${longitude.toFixed(6)}`;
        setInfo((prev) => ({ ...prev, mapLink: link }));
        setLocating(false);
        showToast('Location captured');
      },
      (err) => {
        setLocating(false);
        showToast(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied'
            : 'Could not get location',
          'error'
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    // The Firestore rules check every line against the catalog with one
    // lookup each, capped at 10 lines per order.
    if (items.length > 10) {
      showToast('For more than 10 different items, please order on WhatsApp.', 'error');
      return;
    }

    setSubmitting(true);
    const orderId = generateOrderId();
    const dateDisplay = formatDate(new Date());

    try {
      // Cart lines are price snapshots from add-to-cart; the rules reject
      // orders whose prices no longer match the catalog. Re-price first and
      // let the customer confirm the new total if anything changed.
      const prices = await productService.getCurrentPrices(items.map((i) => i.id));
      if (syncPrices(prices)) {
        showToast('Some prices or items in your cart changed. Please review your total and place the order again.', 'error');
        return;
      }
      // Recompute from the (unchanged) cart so the totals are exact.
      const liveSubtotal = useCartStore.getState().getTotal();
      const liveFee = getDeliveryFee(liveSubtotal);

      await orderService.create({
        orderId,
        customer: info,
        items: useCartStore.getState().items,
        subtotal: liveSubtotal,
        deliveryFee: liveFee,
        total: liveSubtotal + liveFee,
        status: 'pending',
        createdAt: new Date().toISOString(),
        dateDisplay,
      });

      trackPurchase({ orderId, items, value: liveSubtotal + liveFee });
      setPlacedOrder({
        orderId,
        phone: info.phone,
        total: liveSubtotal + liveFee,
      });
      clearCart();
      showToast('Order placed successfully!');
    } catch (error) {
      console.error('Order error:', error);
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (placedOrder) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose}>
        <div className="p-6 sm:p-8 md:p-10 text-center">
          <button
            onClick={handleClose}
            aria-label="Close"
            className="absolute top-4 right-4"
          >
            <X size={22} />
          </button>
          <div className="w-20 h-20 bg-[#2d6a4f]/15 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={42} className="text-[#2d6a4f]" />
          </div>
          <div className="text-[10px] tracking-[0.4em] uppercase text-bronze mb-2">
            ✦ Order Placed
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-light mb-3">
            Thank you!
          </h2>
          <p className="text-mocha mb-6 max-w-sm mx-auto">
            Aap ka order successfully place ho gaya hai. Hum jald hi aap ko{' '}
            <strong className="text-charcoal">{placedOrder.phone}</strong> par
            call/WhatsApp kar ke confirm karenge.
          </p>

          <div className="bg-sand/60 border border-stone p-4 mb-6 inline-flex flex-col gap-2 text-sm text-left min-w-[220px]">
            <div className="flex items-center gap-2 text-bronze">
              <Package size={14} />
              <span className="text-[10px] tracking-[0.3em] uppercase">
                Order ID
              </span>
            </div>
            <div className="font-mono text-base text-charcoal">
              {placedOrder.orderId}
            </div>
            <div className="border-t border-stone/70 pt-2 flex justify-between">
              <span className="text-mocha text-xs">Total</span>
              <span className="font-medium">{formatPrice(placedOrder.total)}</span>
            </div>
          </div>

          <p className="text-[11px] text-mocha mb-6">
            Estimated delivery: <strong>{STORE_CONFIG.deliveryDays}</strong> nationwide
          </p>

          <button
            onClick={handleClose}
            className="btn-primary w-full max-w-xs mx-auto"
          >
            Continue Shopping
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex items-start justify-between gap-3 mb-5 md:mb-6">
          <div className="min-w-0">
            <div className="text-[9px] tracking-[0.35em] md:tracking-[0.4em] uppercase text-bronze">
              ✦ Final Step
            </div>
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl mt-1">Delivery Details</h2>
          </div>
          <button onClick={handleClose} aria-label="Close" className="shrink-0 p-1 -mr-1">
            <X size={22} />
          </button>
        </div>

        <div className="bg-sand/60 border border-stone/70 p-3 mb-5 text-[12px] text-mocha flex items-start gap-2">
          <Truck size={14} className="text-bronze mt-0.5 shrink-0" />
          <span>
            {deliveryFee === 0 ? (
              <>
                <strong className="text-[#2d6a4f]">FREE delivery</strong> applied —
                arrives in <strong>{STORE_CONFIG.deliveryDays}</strong>.
              </>
            ) : (
              <>
                Delivery charge <strong>{formatPrice(deliveryFee)}</strong> —
                spend{' '}
                <strong>
                  {formatPrice(STORE_CONFIG.freeDeliveryMinTotal - subtotal)}
                </strong>{' '}
                more for free delivery. Arrives in{' '}
                <strong>{STORE_CONFIG.deliveryDays}</strong>.
              </>
            )}
          </span>
        </div>

        <div className="space-y-4">
          <FormField
            label="Full Name *"
            value={info.name}
            onChange={(v) => setInfo({ ...info, name: v })}
            error={errors.name}
            placeholder="Enter your full name"
          />
          <FormField
            label="Phone Number *"
            value={info.phone}
            onChange={(v) => setInfo({ ...info, phone: v })}
            error={errors.phone}
            placeholder="03XX XXXXXXX"
            type="tel"
          />
          <FormField
            label="Complete Address *"
            value={info.address}
            onChange={(v) => setInfo({ ...info, address: v })}
            error={errors.address}
            placeholder="House#, Street, Area"
            multiline
          />
          <FormField
            label="City *"
            value={info.city}
            onChange={(v) => setInfo({ ...info, city: v })}
            error={errors.city}
            placeholder="Karachi / Lahore / etc."
          />

          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
              Pin Location (Optional)
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={useCurrentLocation}
                disabled={locating}
                className="btn-outline px-4 py-2 text-xs whitespace-nowrap flex items-center gap-2 disabled:opacity-50"
              >
                {locating ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <MapPin size={14} />
                )}
                {locating ? 'Locating...' : 'Use My Location'}
              </button>
              {info.mapLink && (
                <a
                  href={info.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-bronze underline truncate flex-1 self-center"
                >
                  View on map
                </a>
              )}
            </div>
            <p className="text-[10px] text-mocha mt-1">
              Helps our rider find you faster
            </p>
          </div>

          <FormField
            label="Order Notes (Optional)"
            value={info.notes || ''}
            onChange={(v) => setInfo({ ...info, notes: v })}
            placeholder="Any special instructions..."
            multiline
          />
        </div>

        <div className="bg-sand p-4 my-6 space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-mocha">Subtotal ({itemCount} items)</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-mocha">Delivery</span>
            <span>
              {deliveryFee === 0 ? (
                <span className="text-[#2d6a4f]">FREE</span>
              ) : (
                formatPrice(deliveryFee)
              )}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-stone">
            <span className="text-xs tracking-[0.2em] uppercase">Order Total</span>
            <span className="font-serif text-xl">{formatPrice(grandTotal)}</span>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Package size={14} />
          {submitting ? 'Placing Order...' : 'Place Order'}
        </button>
        <p className="text-[11px] text-mocha text-center mt-3">
          We&apos;ll contact you on your phone shortly to confirm
        </p>
        <p className="text-[11px] text-mocha/80 text-center mt-1.5">
          By placing this order you agree to our{' '}
          <a
            href="/return-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-bronze hover:text-charcoal underline underline-offset-2"
          >
            7-day Return Policy
          </a>
          .
        </p>
      </div>
    </Modal>
  );
}

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  type?: string;
  multiline?: boolean;
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  error,
  type = 'text',
  multiline,
}: FormFieldProps) {
  return (
    <div>
      <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="input-field min-h-[80px] resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="input-field"
        />
      )}
      {error && <div className="text-xs text-[#c94b4b] mt-1">{error}</div>}
    </div>
  );
}

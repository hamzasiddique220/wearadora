'use client';

import { useState } from 'react';
import { X, Phone, MapPin, Loader2, Truck } from 'lucide-react';
import { CustomerInfo } from '@/types';
import { useCartStore } from '@/lib/stores/cart';
import { useUIStore } from '@/lib/stores/ui';
import { orderService } from '@/lib/services/orders';
import { buildOrderMessage, getWhatsAppUrl } from '@/lib/whatsapp';
import { generateOrderId, formatDate, formatPrice } from '@/lib/utils';
import { STORE_CONFIG, getDeliveryFee } from '@/lib/constants';
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
  const showToast = useUIStore((state) => state.showToast);

  const deliveryFee = getDeliveryFee(itemCount);
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

    setSubmitting(true);
    const orderId = generateOrderId();
    const dateDisplay = formatDate(new Date());

    const message = buildOrderMessage({
      orderId,
      date: dateDisplay,
      customer: info,
      items,
      subtotal,
      deliveryFee,
      total: grandTotal,
    });

    try {
      await orderService.create({
        orderId,
        customer: info,
        items,
        total: grandTotal,
        status: 'pending',
        createdAt: new Date().toISOString(),
        dateDisplay,
      });

      const url = getWhatsAppUrl(message);
      window.open(url, '_blank');

      clearCart();
      onClose();
      showToast('Order placed! Redirecting to WhatsApp...');
    } catch (error) {
      console.error('Order error:', error);
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-[9px] tracking-[0.4em] uppercase text-bronze">
              ✦ Final Step
            </div>
            <h2 className="font-serif text-2xl md:text-3xl mt-1">Delivery Details</h2>
          </div>
          <button onClick={onClose} aria-label="Close">
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
                Delivery charge <strong>{formatPrice(deliveryFee)}</strong> — add{' '}
                <strong>{STORE_CONFIG.freeDeliveryMinItems - itemCount}</strong> more{' '}
                {STORE_CONFIG.freeDeliveryMinItems - itemCount === 1
                  ? 'item'
                  : 'items'}{' '}
                for free delivery. Arrives in{' '}
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
          className="w-full bg-[#25D366] text-white py-4 text-xs tracking-[0.2em] uppercase hover:bg-[#1fa855] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Phone size={14} />
          {submitting ? 'Processing...' : 'Send Order on WhatsApp'}
        </button>
        <p className="text-[11px] text-mocha text-center mt-3">
          You&apos;ll be redirected to WhatsApp to confirm your order
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

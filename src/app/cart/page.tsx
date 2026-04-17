'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Plus, Minus, Trash2, Phone } from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart';
import { formatPrice } from '@/lib/utils';
import CheckoutModal from '@/components/cart/CheckoutModal';

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.getTotal());
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const [showCheckout, setShowCheckout] = useState(false);

  if (items.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-20 text-center">
        <div className="w-20 h-20 bg-sand flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={32} className="text-bronze" />
        </div>
        <h2 className="font-serif text-3xl mb-3">Your bag is empty</h2>
        <p className="text-mocha mb-8">Start adding treasures to your collection</p>
        <Link href="/shop" className="btn-primary inline-block">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12">
        <div className="text-center mb-10">
          <span className="text-[10px] tracking-[0.4em] uppercase text-bronze">
            ✦ Your Selection
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-light mt-2">
            Shopping Bag
          </h1>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 md:p-6 grid grid-cols-[100px_1fr] md:grid-cols-[120px_1fr_auto] gap-4 md:gap-6 items-center"
              >
                <div className="aspect-square bg-sand overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-[9px] tracking-[0.3em] uppercase text-bronze mb-1">
                    {item.category}
                  </div>
                  <h3 className="font-serif text-lg mb-2">{item.name}</h3>
                  <div className="text-sm mb-3">{formatPrice(item.price)}</div>
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center border border-stone">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 hover:bg-sand"
                        aria-label="Decrease"
                      >
                        <Minus size={14} className="mx-auto" />
                      </button>
                      <span className="w-10 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 hover:bg-sand"
                        aria-label="Increase"
                      >
                        <Plus size={14} className="mx-auto" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[#c94b4b] hover:bg-[#fee] p-2"
                      aria-label="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="text-right col-span-2 md:col-span-1 font-medium">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-charcoal text-cream p-8 h-fit sticky top-24">
            <h3 className="font-serif text-2xl mb-6 pb-4 border-b border-stone/20">
              Order Summary
            </h3>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-stone">Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone">Delivery</span>
                <span>Calculated at checkout</span>
              </div>
            </div>
            <div className="flex justify-between font-serif text-xl pb-6 border-b border-stone/20 mb-6">
              <span>Total</span>
              <span className="text-bronze">{formatPrice(total)}</span>
            </div>
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full bg-[#25D366] text-white py-4 text-xs tracking-[0.2em] uppercase hover:bg-[#1fa855] transition-colors flex items-center justify-center gap-2"
            >
              <Phone size={14} /> Checkout via WhatsApp
            </button>
            <p className="text-xs text-stone/70 text-center mt-4">
              Secure ordering • Quick confirmation
            </p>
          </div>
        </div>
      </div>

      <CheckoutModal isOpen={showCheckout} onClose={() => setShowCheckout(false)} />
    </>
  );
}

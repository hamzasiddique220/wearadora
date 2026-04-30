'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Plus, Minus, Trash2, Truck, Package } from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart';
import { formatPrice } from '@/lib/utils';
import { COLOR_HEX, STORE_CONFIG, getDeliveryFee } from '@/lib/constants';
import CheckoutModal from '@/components/cart/CheckoutModal';

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getTotal());
  const itemCount = useCartStore((state) => state.getCount());
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const deliveryFee = getDeliveryFee(itemCount);
  const total = subtotal + deliveryFee;
  const itemsToFreeDelivery = Math.max(
    0,
    STORE_CONFIG.freeDeliveryMinItems - itemCount
  );

  const [showCheckout, setShowCheckout] = useState(false);

  if (items.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 py-16 md:py-20 text-center">
        <div className="w-20 h-20 bg-sand flex items-center justify-center mx-auto mb-6 rounded-full">
          <ShoppingBag size={32} className="text-bronze" />
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl mb-3">Your bag is empty</h2>
        <p className="text-mocha mb-8 text-sm md:text-base">Start adding treasures to your collection</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/jewelry" className="btn-primary inline-block">
            Shop Jewelry
          </Link>
          <Link href="/slippers" className="btn-outline inline-block">
            Shop Shoes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 md:px-12 py-8 md:py-12">
        <div className="text-center mb-8 md:mb-10">
          <span className="text-[10px] tracking-[0.35em] md:tracking-[0.4em] uppercase text-bronze">
            ✦ Your Selection
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mt-2">
            Shopping Bag
          </h1>
          <p className="text-xs md:text-sm text-mocha mt-2">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your bag
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          <div className="md:col-span-2 space-y-3 md:space-y-4">
            {items.map((item) => (
              <div
                key={item.cartLineId}
                className="bg-white p-3 sm:p-4 md:p-6 grid grid-cols-[88px_1fr] md:grid-cols-[120px_1fr_auto] gap-3 sm:gap-4 md:gap-6 items-start md:items-center shadow-sm"
              >
                <div className="aspect-square bg-cream overflow-hidden [&_img]:[mix-blend-mode:darken]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain p-1.5"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap mb-1">
                    <div className="text-[9px] tracking-[0.25em] md:tracking-[0.3em] uppercase text-bronze">
                      {item.category}
                    </div>
                    {item.sku && (
                      <code className="text-[9px] font-mono text-mocha/80 hidden sm:inline">
                        {item.sku}
                      </code>
                    )}
                  </div>
                  <h3 className="font-serif text-base sm:text-lg mb-1.5 leading-tight line-clamp-2">
                    {item.name}
                  </h3>

                  {(item.selectedSize || item.selectedColor) && (
                    <div className="flex flex-wrap gap-1.5 md:gap-2 mb-2 text-[11px] text-mocha">
                      {item.selectedSize && (
                        <span className="px-2 py-0.5 bg-sand">
                          Size: {item.selectedSize}
                        </span>
                      )}
                      {item.selectedColor && (
                        <span className="px-2 py-0.5 bg-sand flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-stone"
                            style={{
                              backgroundColor:
                                COLOR_HEX[item.selectedColor] || '#ccc',
                            }}
                          />
                          {item.selectedColor}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-baseline gap-2 mb-2 md:mb-3 flex-wrap">
                    <span className="text-sm font-medium">{formatPrice(item.price)}</span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="text-xs text-mocha line-through">
                        {formatPrice(item.originalPrice)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                    <div className="inline-flex items-center border border-stone">
                      <button
                        onClick={() => updateQuantity(item.cartLineId, -1)}
                        className="w-9 h-9 md:w-8 md:h-8 hover:bg-sand"
                        aria-label="Decrease"
                      >
                        <Minus size={14} className="mx-auto" />
                      </button>
                      <span className="w-10 text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartLineId, 1)}
                        className="w-9 h-9 md:w-8 md:h-8 hover:bg-sand"
                        aria-label="Increase"
                      >
                        <Plus size={14} className="mx-auto" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.cartLineId)}
                      className="text-[#c94b4b] hover:bg-[#fee] p-2 ml-auto md:ml-0"
                      aria-label="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="text-right col-span-2 md:col-span-1 font-medium pt-2 md:pt-0 border-t md:border-t-0 border-stone/40">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-charcoal text-cream p-6 sm:p-7 md:p-8 h-fit md:sticky md:top-24">
            <h3 className="font-serif text-xl sm:text-2xl mb-5 md:mb-6 pb-3 md:pb-4 border-b border-stone/20">
              Order Summary
            </h3>

            {itemsToFreeDelivery > 0 ? (
              <div className="bg-bronze/15 border border-bronze/40 text-cream p-3 mb-5 text-[11px] tracking-[0.05em] flex items-start gap-2">
                <Truck size={14} className="text-bronze mt-0.5 shrink-0" />
                <span>
                  Add{' '}
                  <strong className="text-bronze">{itemsToFreeDelivery}</strong>{' '}
                  more {itemsToFreeDelivery === 1 ? 'item' : 'items'} to unlock{' '}
                  <strong>FREE delivery</strong>.
                </span>
              </div>
            ) : (
              <div className="bg-[#2d6a4f]/25 border border-[#2d6a4f]/60 text-cream p-3 mb-5 text-[11px] tracking-[0.05em] flex items-start gap-2">
                <Truck size={14} className="text-[#7ac196] mt-0.5 shrink-0" />
                <span>
                  <strong className="text-[#7ac196]">FREE delivery</strong>{' '}
                  unlocked on your order.
                </span>
              </div>
            )}

            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-stone">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone">Delivery</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-[#7ac196]">FREE</span>
                  ) : (
                    formatPrice(deliveryFee)
                  )}
                </span>
              </div>
              <div className="text-[11px] text-stone/70 -mt-1">
                Estimated arrival: {STORE_CONFIG.deliveryDays}
              </div>
            </div>
            <div className="flex justify-between font-serif text-xl pb-6 border-b border-stone/20 mb-6">
              <span>Total</span>
              <span className="text-bronze">{formatPrice(total)}</span>
            </div>
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full bg-bronze text-white py-4 text-xs tracking-[0.2em] uppercase hover:bg-charcoal transition-colors flex items-center justify-center gap-2"
            >
              <Package size={14} /> Place Order
            </button>
            <p className="text-xs text-stone/70 text-center mt-4">
              Secure ordering • We&apos;ll call to confirm
            </p>
          </div>
        </div>
      </div>

      <CheckoutModal isOpen={showCheckout} onClose={() => setShowCheckout(false)} />
    </>
  );
}

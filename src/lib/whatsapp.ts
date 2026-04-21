import { CartItem, CustomerInfo } from '@/types';
import { STORE_CONFIG } from './constants';
import { formatPrice } from './utils';

export interface OrderMessageData {
  orderId: string;
  date: string;
  customer: CustomerInfo;
  items: CartItem[];
  total: number;
  subtotal?: number;
  deliveryFee?: number;
}

export const buildOrderMessage = (data: OrderMessageData): string => {
  const { orderId, date, customer, items, total, subtotal, deliveryFee } = data;

  let msg = `*🌟 NEW ORDER — ${STORE_CONFIG.name}*\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n`;
  msg += `📋 *Order ID:* ${orderId}\n`;
  msg += `📅 *Date:* ${date}\n\n`;
  msg += `*👤 CUSTOMER DETAILS*\n`;
  msg += `Name: ${customer.name}\n`;
  msg += `Phone: ${customer.phone}\n`;
  msg += `Address: ${customer.address}\n`;
  msg += `City: ${customer.city}\n`;
  if (customer.mapLink) msg += `📍 Location: ${customer.mapLink}\n`;
  if (customer.notes) msg += `Notes: ${customer.notes}\n`;
  msg += `\n*🛍️ ORDER ITEMS*\n`;

  items.forEach((item, i) => {
    msg += `${i + 1}. ${item.name}\n`;
    msg += `   SKU: ${item.sku?.trim() || item.id}\n`;
    const variantParts: string[] = [];
    if (item.selectedSize) variantParts.push(`Size ${item.selectedSize}`);
    if (item.selectedColor) variantParts.push(item.selectedColor);
    if (variantParts.length > 0) {
      msg += `   _${variantParts.join(' • ')}_\n`;
    }
    msg += `   ${item.quantity} × ${formatPrice(item.price)} = ${formatPrice(
      item.quantity * item.price
    )}\n`;
  });

  msg += `\n━━━━━━━━━━━━━━━━━━\n`;
  if (typeof subtotal === 'number')
    msg += `Subtotal: ${formatPrice(subtotal)}\n`;
  if (typeof deliveryFee === 'number')
    msg += `Delivery: ${
      deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)
    }\n`;
  msg += `💰 *TOTAL: ${formatPrice(total)}*\n`;
  msg += `🚚 Est. delivery: ${STORE_CONFIG.deliveryDays}\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n`;
  msg += `_Please confirm this order to proceed._`;

  return msg;
};

export const getWhatsAppUrl = (message: string, phoneNumber?: string): string => {
  const number = phoneNumber || STORE_CONFIG.whatsappNumber;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
};

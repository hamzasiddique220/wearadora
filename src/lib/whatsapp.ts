import { CartItem, CustomerInfo } from '@/types';
import { STORE_CONFIG } from './constants';
import { formatPrice } from './utils';

export interface OrderMessageData {
  orderId: string;
  date: string;
  customer: CustomerInfo;
  items: CartItem[];
  total: number;
}

export const buildOrderMessage = (data: OrderMessageData): string => {
  const { orderId, date, customer, items, total } = data;

  let msg = `*🌟 NEW ORDER — ${STORE_CONFIG.name}*\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n`;
  msg += `📋 *Order ID:* ${orderId}\n`;
  msg += `📅 *Date:* ${date}\n\n`;
  msg += `*👤 CUSTOMER DETAILS*\n`;
  msg += `Name: ${customer.name}\n`;
  msg += `Phone: ${customer.phone}\n`;
  msg += `Address: ${customer.address}\n`;
  msg += `City: ${customer.city}\n`;
  if (customer.notes) msg += `Notes: ${customer.notes}\n`;
  msg += `\n*🛍️ ORDER ITEMS*\n`;

  items.forEach((item, i) => {
    msg += `${i + 1}. ${item.name}\n`;
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
  msg += `💰 *TOTAL: ${formatPrice(total)}*\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n`;
  msg += `_Please confirm this order to proceed._`;

  return msg;
};

export const getWhatsAppUrl = (message: string, phoneNumber?: string): string => {
  const number = phoneNumber || STORE_CONFIG.whatsappNumber;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
};

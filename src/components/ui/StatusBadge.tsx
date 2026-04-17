import { OrderStatus } from '@/types';

const statusStyles: Record<OrderStatus, string> = {
  pending: 'bg-[#fff3cd] text-[#856404]',
  confirmed: 'bg-[#d1ecf1] text-[#0c5460]',
  shipped: 'bg-[#d4edda] text-[#155724]',
  completed: 'bg-[#2d6a4f] text-white',
  cancelled: 'bg-[#f8d7da] text-[#721c24]',
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-block px-2 py-1 text-[9px] tracking-[0.2em] uppercase mt-1 ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

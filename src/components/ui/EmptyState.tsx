import { Package, LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  message: string;
  icon?: LucideIcon;
}

export default function EmptyState({ message, icon: Icon = Package }: EmptyStateProps) {
  return (
    <div className="text-center py-16 bg-white">
      <div className="w-16 h-16 bg-sand mx-auto mb-4 flex items-center justify-center">
        <Icon size={24} className="text-bronze" />
      </div>
      <p className="text-mocha">{message}</p>
    </div>
  );
}

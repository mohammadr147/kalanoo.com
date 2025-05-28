
import { Suspense } from 'react';
import { Loader2, ShoppingBag } from 'lucide-react';
import { OrderList } from '@/components/admin/order-list'; // Placeholder component

export default function AdminOrdersPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">مدیریت سفارشات</h1>
        </div>
        {/* Add button for actions if needed, e.g., Export Orders */}
      </div>

      <Suspense fallback={
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <OrderList />
      </Suspense>
    </div>
  );
}

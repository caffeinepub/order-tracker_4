import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";
import { useState } from "react";
import { useGetAllOrders } from "../hooks/useQueries";
import type { OrderData } from "../types";
import NewOrderDialog from "./NewOrderDialog";
import OrderList from "./OrderList";
import OrderView from "./OrderView";

export default function OrderTracker() {
  const { data: orders = [], isLoading } = useGetAllOrders();
  const [selectedId, setSelectedId] = useState<bigint | null>(null);
  const [newOrderOpen, setNewOrderOpen] = useState(false);

  const selectedOrder = orders.find((o) => o.id === selectedId) ?? null;

  const handleOrderCreated = (id: bigint) => {
    setSelectedId(id);
    setNewOrderOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-primary/30 bg-primary sticky top-0 z-10 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/uploads/mr_icon-019d2d81-60fb-77ca-bf86-899efd8405f3-1.png"
              alt="MR Logo"
              className="h-8 w-8 object-contain"
            />
            <span className="text-[15px] font-bold text-white tracking-tight">
              MR Orders Dashboard
            </span>
          </div>
          <Button
            onClick={() => setNewOrderOpen(true)}
            size="sm"
            variant="secondary"
            className="h-8 px-3.5 text-xs font-semibold gap-1.5 rounded-full bg-white/90 text-primary hover:bg-white"
            data-ocid="order.open_modal_button"
          >
            <Plus className="w-3.5 h-3.5" />
            New Order
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {isLoading ? (
          <div
            className="flex items-center justify-center py-24"
            data-ocid="orders.loading_state"
          >
            <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
              <div className="w-4 h-4 rounded-full border-2 border-border border-t-primary animate-spin" />
              Loading orders…
            </div>
          </div>
        ) : orders.length === 0 ? (
          <EmptyState onNew={() => setNewOrderOpen(true)} />
        ) : (
          <div className="space-y-5">
            <OrderList
              orders={orders}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
            {selectedOrder ? (
              <OrderView
                order={selectedOrder}
                onDeleted={() => setSelectedId(null)}
              />
            ) : (
              <div
                className="text-center py-10 text-muted-foreground text-sm font-medium"
                data-ocid="orders.empty_state"
              >
                Select an order above to view details
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-16 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
        >
          Built with ♥ using caffeine.ai
        </a>
      </footer>

      <NewOrderDialog
        open={newOrderOpen}
        onOpenChange={setNewOrderOpen}
        onCreated={handleOrderCreated}
      />
    </div>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-28 gap-5"
      data-ocid="orders.empty_state"
    >
      <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center">
        <Package className="w-7 h-7 text-primary" />
      </div>
      <div className="text-center">
        <h2 className="text-base font-bold text-foreground mb-1">
          No orders yet
        </h2>
        <p className="text-sm text-muted-foreground font-medium">
          Create your first order to start tracking
        </p>
      </div>
      <Button
        onClick={onNew}
        size="sm"
        className="h-8 px-4 text-xs font-semibold gap-1.5 rounded-full"
        data-ocid="orders.primary_button"
      >
        <Plus className="w-3.5 h-3.5" />
        Create First Order
      </Button>
    </div>
  );
}

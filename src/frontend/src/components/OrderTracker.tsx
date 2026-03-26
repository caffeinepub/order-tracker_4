import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";
import { useState } from "react";
import type { OrderData } from "../backend";
import { useGetAllOrders } from "../hooks/useQueries";
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
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Package className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-semibold text-foreground tracking-tight">
              Order Tracker
            </h1>
          </div>
          <Button
            onClick={() => setNewOrderOpen(true)}
            size="sm"
            className="gap-1.5"
            data-ocid="order.open_modal_button"
          >
            <Plus className="w-4 h-4" />
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
            <div className="text-muted-foreground text-sm">Loading orders…</div>
          </div>
        ) : orders.length === 0 ? (
          <EmptyState onNew={() => setNewOrderOpen(true)} />
        ) : (
          <div className="space-y-6">
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
                className="text-center py-12 text-muted-foreground text-sm"
                data-ocid="orders.empty_state"
              >
                Select an order above to view details
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-12 py-6 text-center text-xs text-muted-foreground">
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
      className="flex flex-col items-center justify-center py-24 gap-4"
      data-ocid="orders.empty_state"
    >
      <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center">
        <Package className="w-7 h-7 text-primary" />
      </div>
      <div className="text-center">
        <h2 className="text-base font-semibold text-foreground mb-1">
          No orders yet
        </h2>
        <p className="text-sm text-muted-foreground">
          Create your first order to start tracking
        </p>
      </div>
      <Button
        onClick={onNew}
        size="sm"
        className="gap-1.5"
        data-ocid="orders.primary_button"
      >
        <Plus className="w-4 h-4" />
        Create First Order
      </Button>
    </div>
  );
}

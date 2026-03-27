import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import type { OrderData } from "../backend";
import { useActor } from "../hooks/useActor";
import OrderView from "./OrderView";

export default function VendorOrderView({ orderId }: { orderId: bigint }) {
  const { actor, isFetching } = useActor();

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery<OrderData | null>({
    queryKey: ["order", orderId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await actor.getOrder(orderId);
        return result as OrderData;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src="/assets/uploads/mr_icon-019d2d81-60fb-77ca-bf86-899efd8405f3-1.png"
            alt="MR Logo"
            className="h-7 w-7 object-contain"
          />
          <span className="font-bold text-base tracking-tight">
            MR Orders Dashboard
          </span>
        </div>
        <span className="text-xs font-medium opacity-80 bg-white/20 px-2.5 py-1 rounded-full">
          Vendor view · Edit enabled
        </span>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {(isLoading || isFetching) && (
          <div
            className="flex items-center justify-center py-20"
            data-ocid="vendor.loading_state"
          >
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {(isError || (!isLoading && !isFetching && !order)) && (
          <div className="text-center py-20" data-ocid="vendor.error_state">
            <p className="text-lg font-bold text-foreground">Order not found</p>
            <p className="text-sm text-muted-foreground mt-1">
              This link may be invalid or the order has been deleted.
            </p>
          </div>
        )}

        {order && <OrderView order={order} onDeleted={() => {}} />}
      </main>

      <footer className="text-center py-4 text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}

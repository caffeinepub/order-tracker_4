import { cn } from "@/lib/utils";
import type { OrderData } from "../backend";
import { OverallStatus } from "../backend";

interface Props {
  orders: OrderData[];
  selectedId: bigint | null;
  onSelect: (id: bigint) => void;
}

const statusColor: Record<OverallStatus, string> = {
  [OverallStatus.waitingForApproval]: "bg-amber-100 text-amber-700",
  [OverallStatus.inProduction]: "bg-blue-100 text-blue-700",
  [OverallStatus.packaging]: "bg-purple-100 text-purple-700",
  [OverallStatus.dispatched]: "bg-orange-100 text-orange-700",
  [OverallStatus.completed]: "bg-green-100 text-green-700",
};

const statusLabel: Record<OverallStatus, string> = {
  [OverallStatus.waitingForApproval]: "Waiting",
  [OverallStatus.inProduction]: "In Production",
  [OverallStatus.packaging]: "Packaging",
  [OverallStatus.dispatched]: "Dispatched",
  [OverallStatus.completed]: "Completed",
};

export default function OrderList({ orders, selectedId, onSelect }: Props) {
  return (
    <div className="flex gap-2 flex-wrap" data-ocid="orders.list">
      {orders.map((order, i) => (
        <button
          type="button"
          key={order.id.toString()}
          onClick={() => onSelect(order.id)}
          data-ocid={`orders.item.${i + 1}`}
          className={cn(
            "flex items-center gap-2.5 px-3.5 py-2 rounded-lg border text-sm transition-all",
            selectedId === order.id
              ? "border-primary bg-accent text-primary font-medium shadow-xs"
              : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent/50",
          )}
        >
          <span className="font-medium">{order.orderNumber}</span>
          <span className="text-muted-foreground text-xs">·</span>
          <span className="text-muted-foreground text-xs truncate max-w-32">
            {order.clientName}
          </span>
          <span
            className={cn(
              "text-xs px-1.5 py-0.5 rounded-full font-medium",
              statusColor[order.overallStatus],
            )}
          >
            {statusLabel[order.overallStatus]}
          </span>
        </button>
      ))}
    </div>
  );
}

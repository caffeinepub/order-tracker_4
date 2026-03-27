import { cn } from "@/lib/utils";
import type { OrderData } from "../backend";
import { OverallStatus } from "../backend";

interface Props {
  orders: OrderData[];
  selectedId: bigint | null;
  onSelect: (id: bigint) => void;
}

const statusColor: Record<OverallStatus, string> = {
  [OverallStatus.waitingForApproval]:
    "bg-amber-50 text-amber-700 ring-amber-200/60",
  [OverallStatus.inProduction]: "bg-blue-50 text-blue-700 ring-blue-200/60",
  [OverallStatus.packaging]: "bg-violet-50 text-violet-700 ring-violet-200/60",
  [OverallStatus.dispatched]: "bg-orange-50 text-orange-700 ring-orange-200/60",
  [OverallStatus.completed]:
    "bg-emerald-50 text-emerald-700 ring-emerald-200/60",
};

const statusDot: Record<OverallStatus, string> = {
  [OverallStatus.waitingForApproval]: "bg-amber-400",
  [OverallStatus.inProduction]: "bg-blue-500",
  [OverallStatus.packaging]: "bg-violet-500",
  [OverallStatus.dispatched]: "bg-orange-500",
  [OverallStatus.completed]: "bg-emerald-500",
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
            "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-150",
            selectedId === order.id
              ? "border-primary bg-primary text-primary-foreground shadow-sm"
              : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent/60 hover:shadow-xs",
          )}
        >
          <span className="font-bold tracking-tight">{order.orderNumber}</span>
          <span
            className={cn(
              selectedId === order.id
                ? "text-white/60"
                : "text-muted-foreground/60",
            )}
          >
            ·
          </span>
          <span
            className={cn(
              "font-medium truncate max-w-28",
              selectedId === order.id ? "text-white/80" : "text-foreground/70",
            )}
          >
            {order.clientName}
          </span>
          {selectedId !== order.id && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-1",
                statusColor[order.overallStatus],
              )}
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  statusDot[order.overallStatus],
                )}
              />
              {statusLabel[order.overallStatus]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

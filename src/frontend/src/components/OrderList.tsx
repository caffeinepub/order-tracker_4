import { cn } from "@/lib/utils";
import type { OrderData } from "../types";
import { OverallStatus } from "../types";

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
    <div
      className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3"
      data-ocid="orders.list"
    >
      {orders.map((order, i) => (
        <button
          type="button"
          key={order.id.toString()}
          onClick={() => onSelect(order.id)}
          data-ocid={`orders.item.${i + 1}`}
          className={cn(
            "flex flex-col items-start gap-1.5 px-3 py-3 sm:px-4 rounded-xl border text-left transition-all duration-150 w-full sm:min-w-[140px] sm:w-auto",
            selectedId === order.id
              ? "border-primary bg-primary/10 shadow-md ring-1 ring-primary/30"
              : "border-border bg-card hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5",
          )}
        >
          <span
            className={cn(
              "text-sm font-extrabold tracking-tight leading-none",
              selectedId === order.id ? "text-primary" : "text-foreground",
            )}
          >
            {order.orderNumber}
          </span>
          <span
            className={cn(
              "text-xs font-medium truncate w-full leading-none",
              selectedId === order.id
                ? "text-primary/70"
                : "text-muted-foreground",
            )}
          >
            {order.clientName}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-1 mt-0.5",
              statusColor[order.overallStatus],
            )}
          >
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full flex-shrink-0",
                statusDot[order.overallStatus],
              )}
            />
            {statusLabel[order.overallStatus]}
          </span>
        </button>
      ))}
    </div>
  );
}

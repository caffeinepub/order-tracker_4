import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { HttpAgent } from "@icp-sdk/core/agent";
import { useQuery } from "@tanstack/react-query";
import { FileText, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ConfirmationChecklist, OrderData } from "../backend";
import { OverallStatus } from "../backend";
import { loadConfig } from "../config";
import { useActor } from "../hooks/useActor";
import { useOrderFiles } from "../hooks/useOrderFiles";
import { StorageClient } from "../utils/StorageClient";

const statusLabel: Record<OverallStatus, string> = {
  [OverallStatus.waitingForApproval]: "Waiting for Approval",
  [OverallStatus.inProduction]: "In Production",
  [OverallStatus.packaging]: "Packaging",
  [OverallStatus.dispatched]: "Dispatched",
  [OverallStatus.completed]: "Completed",
};

const statusPillClass: Record<OverallStatus, string> = {
  [OverallStatus.waitingForApproval]:
    "bg-amber-100 text-amber-700 ring-1 ring-amber-300/60",
  [OverallStatus.inProduction]:
    "bg-blue-100 text-blue-700 ring-1 ring-blue-300/60",
  [OverallStatus.packaging]:
    "bg-violet-100 text-violet-700 ring-1 ring-violet-300/60",
  [OverallStatus.dispatched]:
    "bg-orange-100 text-orange-700 ring-1 ring-orange-300/60",
  [OverallStatus.completed]:
    "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300/60",
};

const stageBadgeClass: Record<string, string> = {
  preProduction: "bg-amber-100 text-amber-800 border border-amber-300",
  production: "bg-blue-100 text-blue-800 border border-blue-300",
  packaging: "bg-violet-100 text-violet-800 border border-violet-300",
  dispatch: "bg-orange-100 text-orange-800 border border-orange-300",
};

type ChecklistStage = {
  key: keyof ConfirmationChecklist;
  label: string;
  items: { key: string; label: string }[];
};

const STAGES: ChecklistStage[] = [
  {
    key: "preProduction",
    label: "Pre-Production",
    items: [
      { key: "sizeConfirmed", label: "Size confirmed" },
      { key: "colorReferenceConfirmed", label: "Color reference confirmed" },
      { key: "sampleApproved", label: "Sample approved" },
      {
        key: "materialConfirmedAvailable",
        label: "Material confirmed available",
      },
      { key: "timelineCommitted", label: "Timeline committed" },
    ],
  },
  {
    key: "production",
    label: "Production",
    items: [
      { key: "designFileCAD", label: "Design file / CAD ready" },
      { key: "yarnDyingProcess", label: "Yarn dying process done" },
      { key: "colorMatchedWithSample", label: "Color matched with sample" },
      {
        key: "sizeVerifiedDuringProduction",
        label: "Size verified during production",
      },
    ],
  },
  {
    key: "packaging",
    label: "Packaging",
    items: [
      { key: "correctPackagingTypeUsed", label: "Correct packaging type used" },
      { key: "labelsCorrect", label: "Labels correct" },
      { key: "quantityCounted", label: "Quantity counted" },
      { key: "photosTaken", label: "Photos taken" },
    ],
  },
  {
    key: "dispatch",
    label: "Dispatch",
    items: [
      { key: "transportBooked", label: "Transport booked" },
      { key: "dispatchDateConfirmed", label: "Dispatch date confirmed" },
      { key: "clientInformed", label: "Client informed" },
      { key: "trackingShared", label: "Tracking shared" },
    ],
  },
];

interface ProductItem {
  product: string;
  size: string;
  done: boolean;
}

function parseItems(productType: string): ProductItem[] {
  try {
    const parsed = JSON.parse(productType);
    if (Array.isArray(parsed)) {
      return parsed.map((row: any) => ({
        product: row.product ?? "",
        size: row.size ?? "",
        done: row.done ?? false,
      }));
    }
  } catch {
    // not JSON
  }
  if (productType) {
    return [{ product: productType, size: "", done: false }];
  }
  return [];
}

function bigintToDateString(ts: bigint): string {
  if (!ts) return "";
  const ms = Number(ts / 1_000_000n);
  if (ms === 0) return "";
  return new Date(ms).toISOString().split("T")[0];
}

function countChecked(
  stageData: Record<string, unknown>,
  items: { key: string }[],
): number {
  return items.filter((item) => !!stageData[item.key]).length;
}

interface ResolvedFile {
  hash: string;
  name: string;
  mimeType: string;
  url: string;
}

function SharedOrderFiles({ orderId }: { orderId: bigint }) {
  const { files } = useOrderFiles(orderId);
  const [resolvedFiles, setResolvedFiles] = useState<ResolvedFile[]>([]);
  const storageClientRef = useRef<StorageClient | null>(null);

  const getStorageClient = useCallback(async (): Promise<StorageClient> => {
    if (storageClientRef.current) return storageClientRef.current;
    const config = await loadConfig();
    const isLocal = config.backend_host?.includes("localhost");
    const agent = HttpAgent.createSync({
      host: isLocal ? config.backend_host : undefined,
    });
    if (isLocal) {
      await agent.fetchRootKey().catch(() => {});
    }
    const client = new StorageClient(
      config.bucket_name,
      config.storage_gateway_url,
      config.backend_canister_id,
      config.project_id,
      agent,
    );
    storageClientRef.current = client;
    return client;
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function resolve() {
      const client = await getStorageClient();
      const resolved = await Promise.all(
        files.map(async (f) => {
          const url = await client.getDirectURL(f.hash);
          return { hash: f.hash, name: f.name, mimeType: f.mimeType, url };
        }),
      );
      if (!cancelled) setResolvedFiles(resolved);
    }
    if (files.length > 0) {
      resolve();
    } else {
      setResolvedFiles([]);
    }
    return () => {
      cancelled = true;
    };
  }, [files, getStorageClient]);

  if (files.length === 0) return null;

  return (
    <div
      className="bg-card border border-border border-l-4 border-l-emerald-500 rounded-xl shadow-sm p-5 flex flex-col gap-4"
      data-ocid="shared.files.panel"
    >
      <h2 className="text-sm font-bold text-foreground tracking-tight">
        Order Files
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {resolvedFiles.map((f, idx) => (
          <a
            key={f.hash}
            href={f.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg overflow-hidden border border-border shadow-sm block"
            data-ocid={`shared.files.item.${idx + 1}`}
          >
            {f.mimeType.startsWith("image/") ? (
              <img
                src={f.url}
                alt={f.name}
                className="w-full aspect-video object-cover"
              />
            ) : (
              <div className="w-full aspect-video flex flex-col items-center justify-center bg-muted/50 gap-1 px-2">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground text-center truncate w-full">
                  {f.name}
                </p>
              </div>
            )}
          </a>
        ))}
        {files.length > 0 && resolvedFiles.length === 0 && (
          <div className="col-span-2 sm:col-span-3 flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function SharedOrderView({ orderId }: { orderId: bigint }) {
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
        <span className="font-bold text-base tracking-tight">
          Order Tracker
        </span>
        <span className="text-xs font-medium opacity-80 bg-white/20 px-2.5 py-1 rounded-full">
          Shared view · Read only
        </span>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {(isLoading || isFetching) && (
          <div
            className="flex items-center justify-center py-20"
            data-ocid="shared.loading_state"
          >
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {(isError || (!isLoading && !isFetching && !order)) && (
          <div className="text-center py-20" data-ocid="shared.error_state">
            <p className="text-lg font-bold text-foreground">Order not found</p>
            <p className="text-sm text-muted-foreground mt-1">
              This link may be invalid or the order has been deleted.
            </p>
          </div>
        )}

        {order && (
          <div className="grid grid-cols-1 gap-4">
            {/* Order Details */}
            <div
              className="bg-card border border-border border-l-4 border-l-primary rounded-xl shadow-sm p-5 flex flex-col gap-5"
              data-ocid="shared.order.panel"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-sm font-bold text-foreground tracking-tight">
                    Order Details
                  </h2>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">
                    {order.orderNumber} · {order.clientName}
                  </p>
                </div>
                <span
                  className={cn(
                    "text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5",
                    statusPillClass[order.overallStatus],
                  )}
                >
                  {statusLabel[order.overallStatus]}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ReadField label="Order Number" value={order.orderNumber} />
                <ReadField label="Client Name" value={order.clientName} />
                <ReadField
                  label="Dispatch Date"
                  value={bigintToDateString(order.dispatchDate) || "\u2014"}
                />
                <ReadField
                  label="Overall Status"
                  value={statusLabel[order.overallStatus]}
                />
              </div>

              {/* Products Table */}
              <div>
                <p className="text-xs font-bold text-foreground mb-2">
                  Products
                </p>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-indigo-50">
                        <th className="text-left text-[10px] font-bold text-indigo-700 px-2.5 py-2 w-10 uppercase tracking-wider">
                          Done
                        </th>
                        <th className="text-left text-[10px] font-bold text-indigo-700 px-2 py-2 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="text-right text-[10px] font-bold text-indigo-700 px-1 py-2 w-20 uppercase tracking-wider">
                          Size
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {parseItems(order.productType).map((item, idx) => (
                        <tr
                          // biome-ignore lint/suspicious/noArrayIndexKey: items have no stable id
                          key={idx}
                          className={cn(
                            "border-b border-border/60 last:border-0",
                            item.done && "bg-muted/20",
                          )}
                          data-ocid={`shared.order.item.${idx + 1}`}
                        >
                          <td className="px-2.5 py-2 text-center">
                            <Checkbox
                              checked={item.done}
                              disabled
                              className="rounded data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                          </td>
                          <td
                            className={cn(
                              "px-2 py-2 text-sm",
                              item.done
                                ? "line-through text-muted-foreground"
                                : "text-foreground",
                            )}
                          >
                            {item.product || "\u2014"}
                          </td>
                          <td
                            className={cn(
                              "px-1 py-2 text-sm text-right",
                              item.done
                                ? "line-through text-muted-foreground"
                                : "text-foreground",
                            )}
                          >
                            {item.size || "\u2014"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Order Files */}
            <SharedOrderFiles orderId={orderId} />

            {/* Checklist Panel */}
            <div
              className="bg-card border border-border border-l-4 border-l-violet-500 rounded-xl shadow-sm p-5 flex flex-col gap-5"
              data-ocid="shared.checklist.panel"
            >
              <h2 className="text-sm font-bold text-foreground tracking-tight">
                Order Status Checklist
              </h2>
              <div className="flex flex-col gap-5">
                {STAGES.map((stage) => {
                  const stageData = order.confirmationChecklist[
                    stage.key
                  ] as unknown as Record<string, unknown>;
                  const checked = countChecked(stageData, stage.items);
                  const total = stage.items.length;
                  return (
                    <div key={stage.key}>
                      <div className="flex items-center justify-between mb-2.5">
                        <span
                          className={cn(
                            "text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide",
                            stageBadgeClass[stage.key],
                          )}
                        >
                          {stage.label}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums",
                            checked === total
                              ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300/60"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {checked}/{total}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {stage.items.map((item, idx) => (
                          <div
                            key={item.key}
                            className="flex items-center gap-2.5 py-0.5"
                            data-ocid={`shared.checklist.item.${idx + 1}`}
                          >
                            <Checkbox
                              id={`shared-${stage.key}-${item.key}`}
                              checked={!!stageData[item.key]}
                              disabled
                              className="rounded data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label
                              htmlFor={`shared-${stage.key}-${item.key}`}
                              className={cn(
                                "text-sm font-medium select-none",
                                stageData[item.key]
                                  ? "text-muted-foreground line-through decoration-muted-foreground/40"
                                  : "text-foreground",
                              )}
                            >
                              {item.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
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

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-foreground">{label}</span>
      <span className="text-sm text-foreground bg-muted/40 rounded-md px-3 py-2 min-h-[36px] flex items-center">
        {value}
      </span>
    </div>
  );
}

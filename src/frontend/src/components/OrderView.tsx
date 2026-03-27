import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Link, Loader2, Plus, Trash2, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { ConfirmationChecklist, OrderData } from "../backend";
import { OverallStatus } from "../backend";
import { useDeleteOrder, useUpdateOrder } from "../hooks/useQueries";
import OrderFiles from "./OrderFiles";

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

function countChecked(
  stageData: Record<string, unknown>,
  items: { key: string }[],
): number {
  return items.filter((item) => !!stageData[item.key]).length;
}

function bigintToDateString(ts: bigint): string {
  if (!ts) return "";
  const ms = Number(ts / 1_000_000n);
  if (ms === 0) return "";
  const d = new Date(ms);
  return d.toISOString().split("T")[0];
}

function dateStringToBigint(s: string): bigint {
  if (!s) return 0n;
  return BigInt(new Date(s).getTime()) * 1_000_000n;
}

function formatCheckDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const day = d.getDate();
  const month = d.toLocaleString("en", { month: "short" });
  return `${day} ${month}`;
}

interface ProductItem {
  product: string;
  size: string;
  qty: string;
  done: boolean;
}

function emptyItem(): ProductItem {
  return { product: "", size: "", qty: "", done: false };
}

function parseItems(productType: string): ProductItem[] {
  try {
    const parsed = JSON.parse(productType);
    if (Array.isArray(parsed)) {
      return parsed.map((row: any) => ({
        product: row.product ?? "",
        size: row.size ?? "",
        qty: row.qty ?? "",
        done: row.done ?? false,
      }));
    }
  } catch {
    // not JSON
  }
  if (productType) {
    return [{ product: productType, size: "", qty: "", done: false }];
  }
  return [emptyItem()];
}

export default function OrderView({
  order,
  onDeleted,
}: {
  order: OrderData;
  onDeleted: () => void;
}) {
  const updateOrder = useUpdateOrder();
  const deleteOrder = useDeleteOrder();

  const [form, setForm] = useState({
    orderNumber: order.orderNumber,
    clientName: order.clientName,
    dispatchDate: bigintToDateString(order.dispatchDate),
    overallStatus: order.overallStatus,
  });
  const [items, setItems] = useState<ProductItem[]>(() =>
    parseItems(order.productType),
  );
  const [checklist, setChecklist] = useState<ConfirmationChecklist>(
    order.confirmationChecklist,
  );

  const orderId = order.id;

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally sync only on order id change
  useEffect(() => {
    setForm({
      orderNumber: order.orderNumber,
      clientName: order.clientName,
      dispatchDate: bigintToDateString(order.dispatchDate),
      overallStatus: order.overallStatus,
    });
    setItems(parseItems(order.productType));
    setChecklist(order.confirmationChecklist);
  }, [orderId]);

  const updateItem = (
    idx: number,
    field: keyof ProductItem,
    value: string | boolean,
  ) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    );
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);

  const removeItem = (idx: number) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  const buildInput = (
    cl: ConfirmationChecklist,
    currentItems: ProductItem[],
  ) => ({
    orderNumber: form.orderNumber,
    clientName: form.clientName,
    productType: JSON.stringify(currentItems),
    color: "",
    size: { length: 0, width: 0, height: 0 },
    quantity: 0n,
    dispatchDate: dateStringToBigint(form.dispatchDate),
    overallStatus: form.overallStatus,
    confirmationChecklist: cl,
  });

  const handleSave = async () => {
    await updateOrder.mutateAsync({
      id: order.id,
      input: buildInput(checklist, items),
    });
    toast.success("Order saved");
  };

  const handleDoneToggle = async (idx: number, checked: boolean) => {
    const newItems = items.map((item, i) =>
      i === idx ? { ...item, done: checked } : item,
    );
    setItems(newItems);
    await updateOrder.mutateAsync({
      id: order.id,
      input: buildInput(checklist, newItems),
    });
  };

  const handleCheckboxChange = async (
    stage: keyof ConfirmationChecklist,
    key: string,
    checked: boolean,
  ) => {
    const newChecklist = {
      ...checklist,
      [stage]: {
        ...(checklist[stage] as unknown as Record<string, unknown>),
        [key]: checked,
      },
    } as ConfirmationChecklist;
    setChecklist(newChecklist);
    const storageKey = `checklist-date-${orderId.toString()}-${stage}-${key}`;
    if (checked) {
      localStorage.setItem(storageKey, new Date().toISOString());
    } else {
      localStorage.removeItem(storageKey);
    }
    await updateOrder.mutateAsync({
      id: order.id,
      input: buildInput(newChecklist, items),
    });
  };

  const handleDelete = async () => {
    await deleteOrder.mutateAsync(order.id);
    toast.success("Order deleted");
    onDeleted();
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}?order=${order.id.toString()}`;
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const handleVendorLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}?vendor=${order.id.toString()}`;
    await navigator.clipboard.writeText(url);
    toast.success("Vendor link copied");
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Order Details Panel */}
      <div
        className="bg-card border border-border border-l-4 border-l-primary rounded-xl shadow-sm p-5 flex flex-col gap-5"
        data-ocid="order.panel"
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
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5",
                statusPillClass[order.overallStatus],
              )}
            >
              {statusLabel[order.overallStatus]}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1.5 px-2 font-semibold text-muted-foreground hover:text-foreground"
              onClick={handleShare}
              data-ocid="order.secondary_button"
            >
              <Link className="w-3.5 h-3.5" />
              Share
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1.5 px-2 font-semibold text-violet-600 hover:text-violet-800 hover:bg-violet-50"
              onClick={handleVendorLink}
              data-ocid="order.button"
            >
              <Users className="w-3.5 h-3.5" />
              Vendor Link
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Order Number">
            <Input
              value={form.orderNumber}
              onChange={(e) =>
                setForm((p) => ({ ...p, orderNumber: e.target.value }))
              }
              className="h-9 text-sm"
              data-ocid="order.input"
            />
          </Field>
          <Field label="Client Name">
            <Input
              value={form.clientName}
              onChange={(e) =>
                setForm((p) => ({ ...p, clientName: e.target.value }))
              }
              className="h-9 text-sm"
              data-ocid="order.input"
            />
          </Field>
          <Field label="Dispatch Date">
            <Input
              type="date"
              value={form.dispatchDate}
              onChange={(e) =>
                setForm((p) => ({ ...p, dispatchDate: e.target.value }))
              }
              className="h-9 text-sm"
              data-ocid="order.input"
            />
          </Field>
          <Field label="Overall Status">
            <Select
              value={form.overallStatus}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, overallStatus: v as OverallStatus }))
              }
            >
              <SelectTrigger className="h-9 text-sm" data-ocid="order.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusLabel).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        {/* Product Items Table */}
        <div>
          <Label className="text-xs font-bold text-foreground mb-2 block">
            Products
          </Label>
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
                  <th className="text-center text-[10px] font-bold text-indigo-700 px-2 py-2 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="text-center text-[10px] font-bold text-indigo-700 px-2 py-2 w-16 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="w-7" />
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr
                    // biome-ignore lint/suspicious/noArrayIndexKey: items have no stable id
                    key={idx}
                    className={cn(
                      "border-b border-border/60 last:border-0 group hover:bg-muted/30 transition-colors",
                      item.done && "bg-muted/20",
                    )}
                    data-ocid={`order.item.${idx + 1}`}
                  >
                    <td className="px-2.5 py-1 text-center">
                      <Checkbox
                        checked={item.done}
                        onCheckedChange={(c) => handleDoneToggle(idx, !!c)}
                        className="rounded data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        data-ocid={`order.checkbox.${idx + 1}`}
                      />
                    </td>
                    <td className="px-1 py-0.5">
                      <Input
                        value={item.product}
                        onChange={(e) =>
                          updateItem(idx, "product", e.target.value)
                        }
                        className={cn(
                          "h-7 text-xs border-0 shadow-none focus-visible:ring-0 px-1 bg-transparent",
                          item.done && "line-through text-muted-foreground",
                        )}
                        placeholder="Product name"
                        data-ocid="order.input"
                      />
                    </td>
                    <td className="px-1 py-0.5">
                      <Input
                        value={item.size}
                        onChange={(e) =>
                          updateItem(idx, "size", e.target.value)
                        }
                        className={cn(
                          "h-7 text-xs border-0 shadow-none focus-visible:ring-0 px-1 bg-transparent text-center",
                          item.done && "line-through text-muted-foreground",
                        )}
                        placeholder="Size"
                        data-ocid="order.input"
                      />
                    </td>
                    <td className="px-1 py-0.5">
                      <Input
                        value={item.qty}
                        onChange={(e) => updateItem(idx, "qty", e.target.value)}
                        className={cn(
                          "h-7 text-xs border-0 shadow-none focus-visible:ring-0 px-1 bg-transparent text-center",
                          item.done && "line-through text-muted-foreground",
                        )}
                        placeholder="0"
                        data-ocid="order.input"
                      />
                    </td>
                    <td className="px-1 py-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(idx)}
                        data-ocid={`order.delete_button.${idx + 1}`}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-1.5 h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2 font-semibold"
            onClick={addItem}
            data-ocid="order.button"
          >
            <Plus className="w-3 h-3" />
            Add Item
          </Button>
        </div>

        <div className="flex items-center justify-between pt-1 mt-auto border-t border-border">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground hover:text-destructive gap-1.5 px-2 font-semibold"
                data-ocid="order.delete_button"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent data-ocid="order.dialog">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete order?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove order{" "}
                  <strong>{order.orderNumber}</strong>. This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-ocid="order.cancel_button">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  data-ocid="order.confirm_button"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            onClick={handleSave}
            disabled={updateOrder.isPending}
            size="sm"
            className="h-8 px-4 text-xs font-bold rounded-full"
            data-ocid="order.save_button"
          >
            {updateOrder.isPending ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : null}
            {updateOrder.isPending ? "Saving\u2026" : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Checklist + Files Panel */}
      <div
        className="bg-card border border-border border-l-4 border-l-violet-500 rounded-xl shadow-sm p-5 flex flex-col gap-5"
        data-ocid="checklist.panel"
      >
        <h2 className="text-sm font-bold text-foreground tracking-tight">
          Order Status Checklist
        </h2>
        <div className="flex flex-col gap-5">
          {STAGES.map((stage) => {
            const stageData = checklist[stage.key] as unknown as Record<
              string,
              unknown
            >;
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
                  {stage.items.map((item, idx) => {
                    const isChecked = !!stageData[item.key];
                    const dateStr = isChecked
                      ? formatCheckDate(
                          localStorage.getItem(
                            `checklist-date-${orderId.toString()}-${stage.key}-${item.key}`,
                          ),
                        )
                      : "";
                    return (
                      <div
                        key={item.key}
                        className="flex items-center gap-2.5 group py-0.5"
                        data-ocid={`checklist.item.${idx + 1}`}
                      >
                        <Checkbox
                          id={`${stage.key}-${item.key}`}
                          checked={isChecked}
                          onCheckedChange={(c) =>
                            handleCheckboxChange(stage.key, item.key, !!c)
                          }
                          className="rounded data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          data-ocid={`checklist.checkbox.${idx + 1}`}
                        />
                        <Label
                          htmlFor={`${stage.key}-${item.key}`}
                          className={cn(
                            "text-sm font-medium transition-colors cursor-pointer select-none flex items-baseline gap-1",
                            isChecked
                              ? "text-muted-foreground line-through decoration-muted-foreground/40"
                              : "text-foreground group-hover:text-primary",
                          )}
                        >
                          {dateStr && (
                            <span
                              className="text-[10px] font-medium text-muted-foreground/55 tabular-nums no-underline"
                              style={{ textDecoration: "none" }}
                            >
                              {dateStr}
                            </span>
                          )}
                          {item.label}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Files section */}
        <div className="border-t border-border pt-5 mt-1">
          <OrderFiles orderId={order.id} />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-semibold text-foreground">{label}</Label>
      {children}
    </div>
  );
}

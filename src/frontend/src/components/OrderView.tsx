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
import { Loader2, Plus, Trash2, X } from "lucide-react";
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
    "bg-amber-100 text-amber-700 border-amber-200",
  [OverallStatus.inProduction]: "bg-blue-100 text-blue-700 border-blue-200",
  [OverallStatus.packaging]: "bg-purple-100 text-purple-700 border-purple-200",
  [OverallStatus.dispatched]: "bg-orange-100 text-orange-700 border-orange-200",
  [OverallStatus.completed]: "bg-green-100 text-green-700 border-green-200",
};

type ChecklistStage = {
  key: keyof ConfirmationChecklist;
  label: string;
  items: { key: string; label: string }[];
};

const STAGES: ChecklistStage[] = [
  {
    key: "preProduction",
    label: "PRE-PRODUCTION",
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
    label: "PRODUCTION",
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
    label: "PACKAGING",
    items: [
      { key: "correctPackagingTypeUsed", label: "Correct packaging type used" },
      { key: "labelsCorrect", label: "Labels correct" },
      { key: "quantityCounted", label: "Quantity counted" },
      { key: "photosTaken", label: "Photos taken" },
    ],
  },
  {
    key: "dispatch",
    label: "DISPATCH",
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

interface ProductItem {
  product: string;
  designRef: string;
  color: string;
  size: string;
  qty: string;
}

function emptyItem(): ProductItem {
  return { product: "", designRef: "", color: "", size: "", qty: "" };
}

function parseItems(productType: string): ProductItem[] {
  try {
    const parsed = JSON.parse(productType);
    if (Array.isArray(parsed)) return parsed as ProductItem[];
  } catch {
    // not JSON
  }
  if (productType) {
    return [
      { product: productType, designRef: "", color: "", size: "", qty: "" },
    ];
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

  const updateItem = (idx: number, field: keyof ProductItem, value: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    );
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);

  const removeItem = (idx: number) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  const buildInput = (cl: ConfirmationChecklist) => ({
    orderNumber: form.orderNumber,
    clientName: form.clientName,
    productType: JSON.stringify(items),
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
      input: buildInput(checklist),
    });
    toast.success("Order saved");
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
    await updateOrder.mutateAsync({
      id: order.id,
      input: buildInput(newChecklist),
    });
  };

  const handleDelete = async () => {
    await deleteOrder.mutateAsync(order.id);
    toast.success("Order deleted");
    onDeleted();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Left: Order Details */}
      <div
        className="bg-card border border-border rounded-xl shadow-card p-6 flex flex-col gap-5"
        data-ocid="order.panel"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Order Details
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {order.orderNumber} · {order.clientName}
            </p>
          </div>
          <span
            className={cn(
              "text-xs font-medium px-2.5 py-1 rounded-full border",
              statusPillClass[order.overallStatus],
            )}
          >
            {statusLabel[order.overallStatus]}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Order Number">
            <Input
              value={form.orderNumber}
              onChange={(e) =>
                setForm((p) => ({ ...p, orderNumber: e.target.value }))
              }
              data-ocid="order.input"
            />
          </Field>
          <Field label="Client Name">
            <Input
              value={form.clientName}
              onChange={(e) =>
                setForm((p) => ({ ...p, clientName: e.target.value }))
              }
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
              <SelectTrigger data-ocid="order.select">
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
          <Label className="text-xs font-medium text-muted-foreground mb-2 block">
            Products
          </Label>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left text-[11px] font-semibold text-muted-foreground px-2 py-1.5 w-8">
                    #
                  </th>
                  <th className="text-left text-[11px] font-semibold text-muted-foreground px-2 py-1.5">
                    Product
                  </th>
                  <th className="text-left text-[11px] font-semibold text-muted-foreground px-2 py-1.5">
                    Design Ref
                  </th>
                  <th className="text-left text-[11px] font-semibold text-muted-foreground px-2 py-1.5">
                    Color
                  </th>
                  <th className="text-left text-[11px] font-semibold text-muted-foreground px-2 py-1.5">
                    Size
                  </th>
                  <th className="text-left text-[11px] font-semibold text-muted-foreground px-2 py-1.5 w-14">
                    Qty
                  </th>
                  <th className="w-6" />
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr
                    // biome-ignore lint/suspicious/noArrayIndexKey: items have no stable id
                    key={idx}
                    className="border-b border-border last:border-0 group hover:bg-muted/20 transition-colors"
                    data-ocid={`order.item.${idx + 1}`}
                  >
                    <td className="px-2 py-0.5 text-[11px] text-muted-foreground">
                      {idx + 1}
                    </td>
                    <td className="px-1 py-0.5">
                      <Input
                        value={item.product}
                        onChange={(e) =>
                          updateItem(idx, "product", e.target.value)
                        }
                        className="h-7 text-sm border-0 shadow-none focus-visible:ring-0 px-1 bg-transparent"
                        placeholder="Product name"
                        data-ocid="order.input"
                      />
                    </td>
                    <td className="px-1 py-0.5">
                      <Input
                        value={item.designRef}
                        onChange={(e) =>
                          updateItem(idx, "designRef", e.target.value)
                        }
                        className="h-7 text-sm border-0 shadow-none focus-visible:ring-0 px-1 bg-transparent"
                        placeholder="Ref"
                        data-ocid="order.input"
                      />
                    </td>
                    <td className="px-1 py-0.5">
                      <Input
                        value={item.color}
                        onChange={(e) =>
                          updateItem(idx, "color", e.target.value)
                        }
                        className="h-7 text-sm border-0 shadow-none focus-visible:ring-0 px-1 bg-transparent"
                        placeholder="Color"
                        data-ocid="order.input"
                      />
                    </td>
                    <td className="px-1 py-0.5">
                      <Input
                        value={item.size}
                        onChange={(e) =>
                          updateItem(idx, "size", e.target.value)
                        }
                        className="h-7 text-sm border-0 shadow-none focus-visible:ring-0 px-1 bg-transparent"
                        placeholder="Size"
                        data-ocid="order.input"
                      />
                    </td>
                    <td className="px-1 py-0.5">
                      <Input
                        value={item.qty}
                        onChange={(e) => updateItem(idx, "qty", e.target.value)}
                        className="h-7 text-sm border-0 shadow-none focus-visible:ring-0 px-1 bg-transparent"
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
            className="mt-1.5 h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
            onClick={addItem}
            data-ocid="order.button"
          >
            <Plus className="w-3 h-3" />
            Add Item
          </Button>
        </div>

        <div className="flex items-center justify-between pt-1 mt-auto">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive gap-1.5 px-2"
                data-ocid="order.delete_button"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete order
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
            data-ocid="order.save_button"
          >
            {updateOrder.isPending ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : null}
            {updateOrder.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Right: Checklist + Files */}
      <div
        className="bg-card border border-border rounded-xl shadow-card p-6 flex flex-col gap-5"
        data-ocid="checklist.panel"
      >
        <h2 className="text-base font-semibold text-foreground">
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
                  <span className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
                    {stage.label}
                  </span>
                  <span
                    className={cn(
                      "text-[11px] font-semibold px-2 py-0.5 rounded-full",
                      checked === total
                        ? "bg-green-100 text-green-700"
                        : "bg-accent text-primary",
                    )}
                  >
                    {checked}/{total}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {stage.items.map((item, idx) => (
                    <div
                      key={item.key}
                      className="flex items-center gap-2.5 group"
                      data-ocid={`checklist.item.${idx + 1}`}
                    >
                      <Checkbox
                        id={`${stage.key}-${item.key}`}
                        checked={!!stageData[item.key]}
                        onCheckedChange={(c) =>
                          handleCheckboxChange(stage.key, item.key, !!c)
                        }
                        className="rounded-sm data-[state=checked]:bg-[oklch(0.384_0.11_244)] data-[state=checked]:border-[oklch(0.384_0.11_244)]"
                        data-ocid={`checklist.checkbox.${idx + 1}`}
                      />
                      <Label
                        htmlFor={`${stage.key}-${item.key}`}
                        className={cn(
                          "text-sm transition-colors cursor-pointer",
                          stageData[item.key]
                            ? "text-muted-foreground line-through"
                            : "text-foreground group-hover:text-primary",
                        )}
                      >
                        {item.label}
                      </Label>
                    </div>
                  ))}
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
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

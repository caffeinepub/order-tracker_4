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
import { Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { ConfirmationChecklist, OrderData } from "../backend";
import { OverallStatus } from "../backend";
import { useDeleteOrder, useUpdateOrder } from "../hooks/useQueries";

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
    productType: order.productType,
    color: order.color,
    sizeLength: String(order.size.length),
    sizeWidth: String(order.size.width),
    sizeHeight: String(order.size.height),
    quantity: String(order.quantity),
    dispatchDate: bigintToDateString(order.dispatchDate),
    overallStatus: order.overallStatus,
  });
  const [checklist, setChecklist] = useState<ConfirmationChecklist>(
    order.confirmationChecklist,
  );

  const orderId = order.id;

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally sync only on order id change
  useEffect(() => {
    setForm({
      orderNumber: order.orderNumber,
      clientName: order.clientName,
      productType: order.productType,
      color: order.color,
      sizeLength: String(order.size.length),
      sizeWidth: String(order.size.width),
      sizeHeight: String(order.size.height),
      quantity: String(order.quantity),
      dispatchDate: bigintToDateString(order.dispatchDate),
      overallStatus: order.overallStatus,
    });
    setChecklist(order.confirmationChecklist);
  }, [orderId]);

  const buildInput = (cl: ConfirmationChecklist) => ({
    orderNumber: form.orderNumber,
    clientName: form.clientName,
    productType: form.productType,
    color: form.color,
    size: {
      length: Number(form.sizeLength) || 0,
      width: Number(form.sizeWidth) || 0,
      height: Number(form.sizeHeight) || 0,
    },
    quantity: BigInt(Number(form.quantity) || 0),
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
          <Field label="Product Type">
            <Input
              value={form.productType}
              onChange={(e) =>
                setForm((p) => ({ ...p, productType: e.target.value }))
              }
              data-ocid="order.input"
            />
          </Field>
          <Field label="Color">
            <Input
              value={form.color}
              onChange={(e) =>
                setForm((p) => ({ ...p, color: e.target.value }))
              }
              data-ocid="order.input"
            />
          </Field>
          <Field label="Quantity">
            <Input
              type="number"
              value={form.quantity}
              onChange={(e) =>
                setForm((p) => ({ ...p, quantity: e.target.value }))
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
          <Field label="Size (L × W × H)">
            <div className="flex gap-1.5">
              <Input
                type="number"
                placeholder="L"
                value={form.sizeLength}
                onChange={(e) =>
                  setForm((p) => ({ ...p, sizeLength: e.target.value }))
                }
                className="min-w-0"
                data-ocid="order.input"
              />
              <Input
                type="number"
                placeholder="W"
                value={form.sizeWidth}
                onChange={(e) =>
                  setForm((p) => ({ ...p, sizeWidth: e.target.value }))
                }
                className="min-w-0"
                data-ocid="order.input"
              />
              <Input
                type="number"
                placeholder="H"
                value={form.sizeHeight}
                onChange={(e) =>
                  setForm((p) => ({ ...p, sizeHeight: e.target.value }))
                }
                className="min-w-0"
                data-ocid="order.input"
              />
            </div>
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

      {/* Right: Checklist */}
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

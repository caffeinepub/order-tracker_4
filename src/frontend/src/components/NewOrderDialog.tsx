import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateOrder } from "../hooks/useQueries";
import { OverallStatus } from "../types";

const emptyChecklist = {
  preProduction: {
    sizeConfirmed: false,
    colorReferenceConfirmed: false,
    sampleApproved: false,
    materialConfirmedAvailable: false,
    timelineCommitted: false,
  },
  production: {
    designFileCAD: false,
    colorMatchedWithSample: false,
    sizeVerifiedDuringProduction: false,
    yarnDyingProcess: false,
  },
  packaging: {
    correctPackagingTypeUsed: false,
    labelsCorrect: false,
    quantityCounted: false,
    photosTaken: false,
  },
  dispatch: {
    transportBooked: false,
    dispatchDateConfirmed: false,
    clientInformed: false,
    trackingShared: false,
  },
};

const statusLabel: Record<OverallStatus, string> = {
  [OverallStatus.waitingForApproval]: "Waiting for Approval",
  [OverallStatus.inProduction]: "In Production",
  [OverallStatus.packaging]: "Packaging",
  [OverallStatus.dispatched]: "Dispatched",
  [OverallStatus.completed]: "Completed",
};

interface ProductItem {
  product: string;
  size: string;
  done: boolean;
}

function emptyItem(): ProductItem {
  return { product: "", size: "", done: false };
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (id: bigint) => void;
}

export default function NewOrderDialog({
  open,
  onOpenChange,
  onCreated,
}: Props) {
  const createOrder = useCreateOrder();
  const [form, setForm] = useState({
    orderNumber: "",
    clientName: "",
    dispatchDate: "",
    overallStatus: OverallStatus.waitingForApproval,
  });
  const [items, setItems] = useState<ProductItem[]>([emptyItem()]);

  const set = (key: string, value: string) =>
    setForm((p) => ({ ...p, [key]: value }));

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.orderNumber || !form.clientName) {
      toast.error("Order number and client name are required");
      return;
    }
    try {
      const id = await createOrder.mutateAsync({
        orderNumber: form.orderNumber,
        clientName: form.clientName,
        productType: JSON.stringify(items),
        color: "",
        size: { length: 0, width: 0, height: 0 },
        quantity: 0n,
        dispatchDate: form.dispatchDate
          ? BigInt(new Date(form.dispatchDate).getTime()) * 1_000_000n
          : 0n,
        overallStatus: form.overallStatus,
        confirmationChecklist: emptyChecklist,
      });
      toast.success("Order created");
      onCreated(id);
      onOpenChange(false);
      setForm({
        orderNumber: "",
        clientName: "",
        dispatchDate: "",
        overallStatus: OverallStatus.waitingForApproval,
      });
      setItems([emptyItem()]);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create order",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-ocid="order.dialog">
        <DialogHeader>
          <DialogTitle>New Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Order Number *
              </Label>
              <Input
                value={form.orderNumber}
                onChange={(e) => set("orderNumber", e.target.value)}
                placeholder="ORD-001"
                data-ocid="order.input"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Client Name *
              </Label>
              <Input
                value={form.clientName}
                onChange={(e) => set("clientName", e.target.value)}
                placeholder="Acme Corp"
                data-ocid="order.input"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Dispatch Date
              </Label>
              <Input
                type="date"
                value={form.dispatchDate}
                onChange={(e) => set("dispatchDate", e.target.value)}
                data-ocid="order.input"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Status
              </Label>
              <Select
                value={form.overallStatus}
                onValueChange={(v) => set("overallStatus", v)}
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
            </div>
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
                    <th className="text-left text-[11px] font-semibold text-muted-foreground px-2 py-1.5 w-10">
                      Done
                    </th>
                    <th className="text-left text-[11px] font-semibold text-muted-foreground px-2 py-1.5">
                      Product
                    </th>
                    <th className="text-left text-[11px] font-semibold text-muted-foreground px-2 py-1.5">
                      Size
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
                      <td className="px-2 py-0.5 text-center">
                        <Checkbox
                          checked={item.done}
                          onCheckedChange={(c) => updateItem(idx, "done", !!c)}
                          className="rounded"
                          data-ocid={`order.checkbox.${idx + 1}`}
                        />
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

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              data-ocid="order.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createOrder.isPending}
              data-ocid="order.submit_button"
            >
              {createOrder.isPending ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : null}
              {createOrder.isPending ? "Creating\u2026" : "Create Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

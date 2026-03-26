import { Button } from "@/components/ui/button";
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
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { OverallStatus } from "../backend";
import { useCreateOrder } from "../hooks/useQueries";

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
    productType: "",
    color: "",
    sizeLength: "",
    sizeWidth: "",
    sizeHeight: "",
    quantity: "",
    dispatchDate: "",
    overallStatus: OverallStatus.waitingForApproval,
  });

  const set = (key: string, value: string) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.orderNumber || !form.clientName) {
      toast.error("Order number and client name are required");
      return;
    }
    const id = await createOrder.mutateAsync({
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
      dispatchDate: form.dispatchDate
        ? BigInt(new Date(form.dispatchDate).getTime()) * 1_000_000n
        : 0n,
      overallStatus: form.overallStatus,
      confirmationChecklist: emptyChecklist,
    });
    toast.success("Order created");
    onCreated(id);
    setForm({
      orderNumber: "",
      clientName: "",
      productType: "",
      color: "",
      sizeLength: "",
      sizeWidth: "",
      sizeHeight: "",
      quantity: "",
      dispatchDate: "",
      overallStatus: OverallStatus.waitingForApproval,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-ocid="order.dialog">
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
                Product Type
              </Label>
              <Input
                value={form.productType}
                onChange={(e) => set("productType", e.target.value)}
                placeholder="Knitwear"
                data-ocid="order.input"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Color
              </Label>
              <Input
                value={form.color}
                onChange={(e) => set("color", e.target.value)}
                placeholder="Navy Blue"
                data-ocid="order.input"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Quantity
              </Label>
              <Input
                type="number"
                value={form.quantity}
                onChange={(e) => set("quantity", e.target.value)}
                placeholder="100"
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
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Size (L × W × H)
              </Label>
              <div className="flex gap-1.5">
                <Input
                  type="number"
                  placeholder="Length"
                  value={form.sizeLength}
                  onChange={(e) => set("sizeLength", e.target.value)}
                  className="min-w-0"
                  data-ocid="order.input"
                />
                <Input
                  type="number"
                  placeholder="Width"
                  value={form.sizeWidth}
                  onChange={(e) => set("sizeWidth", e.target.value)}
                  className="min-w-0"
                  data-ocid="order.input"
                />
                <Input
                  type="number"
                  placeholder="Height"
                  value={form.sizeHeight}
                  onChange={(e) => set("sizeHeight", e.target.value)}
                  className="min-w-0"
                  data-ocid="order.input"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
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
              {createOrder.isPending ? "Creating…" : "Create Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

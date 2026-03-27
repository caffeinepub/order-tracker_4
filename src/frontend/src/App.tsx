import { Toaster } from "@/components/ui/sonner";
import OrderTracker from "./components/OrderTracker";
import SharedOrderView from "./components/SharedOrderView";
import VendorOrderView from "./components/VendorOrderView";

function getSharedOrderId(): bigint | null {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("order");
  if (!id) return null;
  try {
    return BigInt(id);
  } catch {
    return null;
  }
}

function getVendorOrderId(): bigint | null {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("vendor");
  if (!id) return null;
  try {
    return BigInt(id);
  } catch {
    return null;
  }
}

export default function App() {
  const sharedOrderId = getSharedOrderId();
  const vendorOrderId = getVendorOrderId();

  return (
    <>
      {vendorOrderId !== null ? (
        <VendorOrderView orderId={vendorOrderId} />
      ) : sharedOrderId !== null ? (
        <SharedOrderView orderId={sharedOrderId} />
      ) : (
        <OrderTracker />
      )}
      <Toaster />
    </>
  );
}

import { Toaster } from "@/components/ui/sonner";
import OrderTracker from "./components/OrderTracker";
import SharedOrderView from "./components/SharedOrderView";

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

export default function App() {
  const sharedOrderId = getSharedOrderId();

  return (
    <>
      {sharedOrderId !== null ? (
        <SharedOrderView orderId={sharedOrderId} />
      ) : (
        <OrderTracker />
      )}
      <Toaster />
    </>
  );
}

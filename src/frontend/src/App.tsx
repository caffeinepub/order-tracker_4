import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import OrderTracker from "./components/OrderTracker";

export default function App() {
  return (
    <>
      <OrderTracker />
      <Toaster />
    </>
  );
}

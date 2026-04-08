// Module augmentation to add domain methods to the Backend class.
// This file extends the auto-generated Backend class with the actor methods
// our application needs, fixing missing-property TypeScript errors without
// modifying the protected backend.ts / backend.d.ts generated files.

import type {
  ConfirmationChecklist,
  OrderData,
  OrderInput,
} from "./types/index";

declare module "./backend" {
  interface Backend {
    getAllOrders(): Promise<OrderData[]>;
    createOrder(input: OrderInput): Promise<OrderData>;
    getOrder(id: bigint): Promise<OrderData>;
    updateOrder(id: bigint, input: OrderInput): Promise<OrderData>;
    deleteOrder(id: bigint): Promise<void>;
    getOrderFiles(
      orderId: bigint,
    ): Promise<
      { hash: string; name: string; mimeType: string; uploadedAt: bigint }[]
    >;
    addOrderFile(
      orderId: bigint,
      hash: string,
      name: string,
      mimeType: string,
    ): Promise<void>;
    removeOrderFile(orderId: bigint, hash: string): Promise<void>;
  }

  // Re-export domain types so `import { OverallStatus } from '../backend'` works.
  export type { ConfirmationChecklist, OrderData, OrderInput };
}

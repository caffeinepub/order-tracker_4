// Thin wrapper that pre-binds the project's createActor factory to the
// generic useActor() hook from @caffeineai/core-infrastructure.
// Casts the actor to the full backend interface so TypeScript knows about
// all actor methods (getAllOrders, createOrder, getOrder, etc.).

import { useActor as useActorBase } from "@caffeineai/core-infrastructure";
import { createActor } from "../backend";
import type { OrderData, OrderInput } from "../types";

export interface BackendActor {
  getAllOrders(): Promise<OrderData[]>;
  createOrder(input: OrderInput): Promise<bigint>;
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

export function useActor(): {
  actor: BackendActor | null;
  isFetching: boolean;
} {
  const result = useActorBase(createActor);
  return {
    actor: result.actor as BackendActor | null,
    isFetching: result.isFetching,
  };
}

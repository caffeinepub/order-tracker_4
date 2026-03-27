import { useCallback, useEffect, useState } from "react";
import { useActor } from "./useActor";

export interface OrderFileEntry {
  hash: string;
  name: string;
  mimeType: string;
  uploadedAt: number;
}

function storageKey(orderId: bigint): string {
  return `order-files-${orderId.toString()}`;
}

function loadCache(orderId: bigint): OrderFileEntry[] {
  try {
    const raw = localStorage.getItem(storageKey(orderId));
    if (!raw) return [];
    return JSON.parse(raw) as OrderFileEntry[];
  } catch {
    return [];
  }
}

function saveCache(orderId: bigint, files: OrderFileEntry[]): void {
  localStorage.setItem(storageKey(orderId), JSON.stringify(files));
}

export function useOrderFiles(orderId: bigint) {
  const { actor } = useActor();
  const [files, setFiles] = useState<OrderFileEntry[]>(() =>
    loadCache(orderId),
  );

  // On mount or orderId change, seed from cache then fetch from backend
  useEffect(() => {
    setFiles(loadCache(orderId));

    if (!actor) return;

    actor
      .getOrderFiles(orderId)
      .then((entries) => {
        const mapped: OrderFileEntry[] = entries.map((e) => ({
          hash: e.hash,
          name: e.name,
          mimeType: e.mimeType,
          uploadedAt: Number(e.uploadedAt),
        }));
        setFiles(mapped);
        saveCache(orderId, mapped);
      })
      .catch(() => {
        // Keep showing cached data if fetch fails
      });
  }, [orderId, actor]);

  const addFile = useCallback(
    async (hash: string, name: string, mimeType: string) => {
      if (!actor) return;
      await actor.addOrderFile(orderId, hash, name, mimeType);
      const entry: OrderFileEntry = {
        hash,
        name,
        mimeType,
        uploadedAt: Date.now(),
      };
      setFiles((prev) => {
        const next = [...prev, entry];
        saveCache(orderId, next);
        return next;
      });
    },
    [orderId, actor],
  );

  const removeFile = useCallback(
    async (hash: string) => {
      if (!actor) return;
      await actor.removeOrderFile(orderId, hash);
      setFiles((prev) => {
        const next = prev.filter((f) => f.hash !== hash);
        saveCache(orderId, next);
        return next;
      });
    },
    [orderId, actor],
  );

  return { files, addFile, removeFile };
}

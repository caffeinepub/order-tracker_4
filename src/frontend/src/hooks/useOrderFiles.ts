import { useCallback, useEffect, useState } from "react";

export interface OrderFileEntry {
  hash: string;
  name: string;
  mimeType: string;
  uploadedAt: number;
}

function storageKey(orderId: bigint): string {
  return `order-files-${orderId.toString()}`;
}

function loadFiles(orderId: bigint): OrderFileEntry[] {
  try {
    const raw = localStorage.getItem(storageKey(orderId));
    if (!raw) return [];
    return JSON.parse(raw) as OrderFileEntry[];
  } catch {
    return [];
  }
}

function saveFiles(orderId: bigint, files: OrderFileEntry[]): void {
  localStorage.setItem(storageKey(orderId), JSON.stringify(files));
}

export function useOrderFiles(orderId: bigint) {
  const [files, setFiles] = useState<OrderFileEntry[]>(() =>
    loadFiles(orderId),
  );

  useEffect(() => {
    setFiles(loadFiles(orderId));
  }, [orderId]);

  const addFile = useCallback(
    (hash: string, name: string, mimeType: string) => {
      setFiles((prev) => {
        const entry: OrderFileEntry = {
          hash,
          name,
          mimeType,
          uploadedAt: Date.now(),
        };
        const next = [...prev, entry];
        saveFiles(orderId, next);
        return next;
      });
    },
    [orderId],
  );

  const removeFile = useCallback(
    (hash: string) => {
      setFiles((prev) => {
        const next = prev.filter((f) => f.hash !== hash);
        saveFiles(orderId, next);
        return next;
      });
    },
    [orderId],
  );

  return { files, addFile, removeFile };
}

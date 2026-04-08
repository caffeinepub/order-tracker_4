import { HttpAgent } from "@icp-sdk/core/agent";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { loadConfig } from "../config";
import { useOrderFiles } from "../hooks/useOrderFiles";
import { StorageClient } from "../utils/StorageClient";
import ImageLightbox from "./ImageLightbox";

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
}

interface ResolvedFile {
  hash: string;
  name: string;
  mimeType: string;
  url: string;
}

export default function OrderFiles({ orderId }: { orderId: bigint }) {
  const { files, addFile, removeFile } = useOrderFiles(orderId);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [resolvedFiles, setResolvedFiles] = useState<ResolvedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [lightboxFile, setLightboxFile] = useState<ResolvedFile | null>(null);
  const storageClientRef = useRef<StorageClient | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getStorageClient = useCallback(async (): Promise<StorageClient> => {
    if (storageClientRef.current) return storageClientRef.current;
    const config = await loadConfig();
    const isLocal = config.backend_host?.includes("localhost");
    const agent = HttpAgent.createSync({
      host: isLocal ? config.backend_host : undefined,
    });
    if (isLocal) {
      await agent.fetchRootKey().catch(() => {});
    }
    const client = new StorageClient(
      config.bucket_name,
      config.storage_gateway_url,
      config.backend_canister_id,
      config.project_id,
      agent,
    );
    storageClientRef.current = client;
    return client;
  }, []);

  // Resolve URLs for uploaded files
  useEffect(() => {
    let cancelled = false;
    async function resolve() {
      const client = await getStorageClient();
      const resolved = await Promise.all(
        files.map(async (f) => {
          const url = await client.getDirectURL(f.hash);
          return { hash: f.hash, name: f.name, mimeType: f.mimeType, url };
        }),
      );
      if (!cancelled) setResolvedFiles(resolved);
    }
    if (files.length > 0) {
      resolve();
    } else {
      setResolvedFiles([]);
    }
    return () => {
      cancelled = true;
    };
  }, [files, getStorageClient]);

  const handleFiles = useCallback(
    async (fileList: FileList) => {
      const accepted = Array.from(fileList).filter(
        (f) => f.type.startsWith("image/") || f.type === "application/pdf",
      );
      if (accepted.length === 0) return;

      const client = await getStorageClient();

      for (const file of accepted) {
        const id = `${file.name}-${Date.now()}`;
        setUploading((prev) => [...prev, { id, name: file.name, progress: 0 }]);

        try {
          const bytes = new Uint8Array(await file.arrayBuffer());
          const { hash } = await client.putFile(bytes, (pct) => {
            setUploading((prev) =>
              prev.map((u) => (u.id === id ? { ...u, progress: pct } : u)),
            );
          });
          addFile(hash, file.name, file.type);
        } catch (err) {
          console.error("Upload error:", err);
          const message = err instanceof Error ? err.message : String(err);
          toast.error(`Failed to upload ${file.name}: ${message}`);
        } finally {
          setUploading((prev) => prev.filter((u) => u.id !== id));
        }
      }
    },
    [getStorageClient, addFile],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles],
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = "";
    }
  };

  const isImage = (mimeType: string) => mimeType.startsWith("image/");

  return (
    <div className="flex flex-col gap-4" data-ocid="files.panel">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Order Files</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Design files, packaging photos, etc.
        </p>
      </div>

      {/* Upload zone */}
      <button
        type="button"
        className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 transition-colors cursor-pointer select-none w-full ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
        }`}
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        data-ocid="files.dropzone"
      >
        <Upload className="w-5 h-5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground text-center">
          Drop files here or{" "}
          <span className="text-primary font-medium">click to upload</span>
        </p>
        <p className="text-[11px] text-muted-foreground/60">
          Images &amp; PDFs
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          className="hidden"
          onChange={onInputChange}
          data-ocid="files.upload_button"
        />
      </button>

      {/* Uploading progress items */}
      {uploading.length > 0 && (
        <div className="flex flex-col gap-2">
          {uploading.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2"
              data-ocid="files.loading_state"
            >
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground truncate">{u.name}</p>
                <div className="mt-1 h-1 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${u.progress}%` }}
                  />
                </div>
              </div>
              <span className="text-[11px] text-muted-foreground shrink-0">
                {u.progress}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded files grid */}
      {resolvedFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {resolvedFiles.map((f, idx) => (
            <div
              key={f.hash}
              className="group relative rounded-lg overflow-hidden border border-border shadow-sm cursor-pointer"
              onClick={() => {
                if (isImage(f.mimeType)) {
                  setLightboxFile(f);
                } else {
                  window.open(f.url, "_blank");
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  if (isImage(f.mimeType)) {
                    setLightboxFile(f);
                  } else {
                    window.open(f.url, "_blank");
                  }
                }
              }}
              // biome-ignore lint/a11y/useSemanticElements: file card needs overflow+group styles not possible on <a>
              role="button"
              tabIndex={0}
              data-ocid={`files.item.${idx + 1}`}
            >
              {isImage(f.mimeType) ? (
                <img
                  src={f.url}
                  alt={f.name}
                  className="w-full aspect-video object-cover"
                />
              ) : (
                <div className="w-full aspect-video flex flex-col items-center justify-center bg-muted/50 gap-1 px-2">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground text-center truncate w-full">
                    {f.name}
                  </p>
                </div>
              )}
              <button
                type="button"
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background/90 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(f.hash);
                }}
                data-ocid={`files.delete_button.${idx + 1}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length === 0 && uploading.length === 0 && (
        <p
          className="text-xs text-muted-foreground/60 text-center py-1"
          data-ocid="files.empty_state"
        >
          No files uploaded yet
        </p>
      )}

      {lightboxFile && (
        <ImageLightbox
          src={lightboxFile.url}
          alt={lightboxFile.name}
          onClose={() => setLightboxFile(null)}
        />
      )}
    </div>
  );
}

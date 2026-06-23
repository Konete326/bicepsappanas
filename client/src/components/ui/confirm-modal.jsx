import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Global confirmation modal — driven by ConfirmContext.
 * Shows a smooth centered dialog with a dark backdrop.
 */
export function ConfirmModal({ open, title, message, confirmLabel = "Delete", onConfirm, onCancel }) {
  const cancelRef = useRef(null);

  /* focus the Cancel button on open for keyboard accessibility */
  useEffect(() => {
    if (open) {
      setTimeout(() => cancelRef.current?.focus(), 50);
    }
  }, [open]);

  /* close on Escape key */
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape" && open) onCancel(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200"
      aria-modal="true"
      role="dialog"
    >
      {/* Dark overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
      />

      {/* Panel */}
      <div
        className="relative z-10 bg-white rounded-xl shadow-lg border border-stone-200 w-full max-w-sm mx-4 overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Top accent strip */}
        <div className="h-1 w-full bg-gradient-to-r from-red-400 via-red-500 to-rose-500" />

        {/* Body */}
        <div className="px-6 pt-5 pb-6">
          {/* Icon + Title */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
              <AlertTriangle size={17} className="text-red-500" />
            </div>
            <h3 className="text-base font-bold text-stone-800">
              {title || "Confirm Delete"}
            </h3>
          </div>

          <p className="text-sm text-stone-500 leading-relaxed mb-6">
            {message || "Are you sure? This action cannot be undone."}
          </p>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              ref={cancelRef}
              type="button"
              variant="outline"
              onClick={onCancel}
              className="text-sm rounded-full border-stone-200 text-stone-600 hover:bg-stone-50 px-5"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              className="text-sm rounded-full bg-red-600 hover:bg-red-700 text-white px-5"
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, type ReactNode } from "react";

export function Modal({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(27,26,22,0.45)",
        display: "grid", placeItems: "center", zIndex: 50,
        animation: "fadeIn .15s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--paper)", borderRadius: 16, padding: 28,
          maxWidth: 480, width: "92%",
          border: "1px solid var(--line)",
          boxShadow: "0 30px 80px rgba(27,26,22,0.18)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

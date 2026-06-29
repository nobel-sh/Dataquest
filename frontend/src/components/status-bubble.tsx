"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type StatusKind = "loading" | "success" | "error" | "info";

type StatusMessage = {
  id: number;
  kind: StatusKind;
  title: string;
  detail?: string;
};

type StatusBubbleContextValue = {
  showStatus: (message: Omit<StatusMessage, "id">, options?: { autoDismissMs?: number }) => void;
  clearStatus: () => void;
};

const StatusBubbleContext = createContext<StatusBubbleContextValue | null>(null);

export function StatusBubbleProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<StatusMessage | null>(null);
  const nextId = useRef(1);
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearStatus = useCallback(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
      timeoutId.current = null;
    }
    setMessage(null);
  }, []);

  const showStatus = useCallback(
    (nextMessage: Omit<StatusMessage, "id">, options: { autoDismissMs?: number } = {}) => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
        timeoutId.current = null;
      }

      setMessage({ ...nextMessage, id: nextId.current });
      nextId.current += 1;

      if (options.autoDismissMs) {
        timeoutId.current = setTimeout(() => {
          setMessage(null);
          timeoutId.current = null;
        }, options.autoDismissMs);
      }
    },
    [],
  );

  const value = useMemo(
    () => ({
      showStatus,
      clearStatus,
    }),
    [clearStatus, showStatus],
  );

  return (
    <StatusBubbleContext.Provider value={value}>
      {children}
      <StatusBubble message={message} onClose={clearStatus} />
    </StatusBubbleContext.Provider>
  );
}

export function useStatusBubble() {
  const context = useContext(StatusBubbleContext);
  if (!context) {
    throw new Error("useStatusBubble must be used within StatusBubbleProvider");
  }
  return context;
}

function StatusBubble({
  message,
  onClose,
}: {
  message: StatusMessage | null;
  onClose: () => void;
}) {
  if (!message) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 w-[min(360px,calc(100vw-2rem))] border border-line bg-panel shadow-panel">
      <div className="flex items-start gap-3 px-4 py-4">
        <StatusIndicator kind={message.kind} />
        <div className="min-w-0 flex-1">
          <div className="font-semibold">{message.title}</div>
          {message.detail ? (
            <div className="mt-1 break-words text-sm leading-5 text-ink-muted">
              {message.detail}
            </div>
          ) : null}
        </div>
        <button
          aria-label="Dismiss status"
          className="border border-line bg-[#30333d] px-2 py-1 text-xs uppercase text-ink-muted transition hover:bg-[#3b3e49] hover:text-ink"
          type="button"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

function StatusIndicator({ kind }: { kind: StatusKind }) {
  const className = {
    loading: "border-accent",
    success: "border-line-success bg-success",
    error: "border-line-error bg-error",
    info: "border-ember",
  }[kind];

  return (
    <span
      aria-hidden="true"
      className={`mt-1 size-3 shrink-0 rounded-full border-2 ${className} ${
        kind === "loading" ? "animate-pulse" : ""
      }`}
    />
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { skeletonBlockClassName } from "@/components/ui/styles";
import { getCurrentUser, logoutSession } from "@/lib/auth";
import type { User } from "@/lib/types";

export function SessionMenu() {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      try {
        const user = await getCurrentUser();
        if (!cancelled) {
          setCurrentUser(user);
        }
      } catch {
        if (!cancelled) {
          setCurrentUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function logout() {
    await logoutSession();
    setCurrentUser(null);
    setIsOpen(false);
    router.push("/auth");
    router.refresh();
  }

  if (isLoading) {
    return (
      <div className="inline-flex min-h-control w-full items-center border border-line bg-panel px-4 py-2 text-sm text-ink-muted sm:w-auto">
        <span className={`h-4 w-28 ${skeletonBlockClassName}`} />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Link
        className="inline-flex min-h-control w-full items-center justify-center border border-line bg-panel px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-ink-onDark sm:w-auto"
        href="/auth"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="relative w-full sm:w-auto" ref={menuRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="inline-flex min-h-control w-full items-center justify-between gap-3 border border-line bg-panel px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-ink-onDark sm:max-w-[260px]"
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        <span className="truncate">{currentUser.email}</span>
        <ChevronDownIcon />
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-20 mt-2 w-full min-w-52 border border-line bg-panel shadow-panel sm:w-52">
          <Link
            className="block border-b border-line px-4 py-3 text-sm text-ink transition hover:bg-[#262932] hover:text-ink-onDark"
            href="/account"
            onClick={() => setIsOpen(false)}
          >
            Account
          </Link>
          <button
            className="block w-full px-4 py-3 text-left text-sm text-ink transition hover:bg-[#262932] hover:text-ink-onDark"
            type="button"
            onClick={() => void logout()}
          >
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0 text-ink-muted"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

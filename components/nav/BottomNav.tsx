"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, SquaresFour, Buildings, UserCircle } from "@phosphor-icons/react";
import { useUserStore } from "@/lib/store/userStore";
import { signOut } from "@/lib/supabase/auth";
import { AuthModal } from "@/components/auth/AuthModal";

const NAV_ITEMS = [
  { href: "/",           label: "MAP",        Icon: MapPin },
  { href: "/collection", label: "COLLECTION", Icon: SquaresFour },
  { href: "/cities",     label: "VILLES",     Icon: Buildings },
];

export function BottomNav() {
  const pathname = usePathname();
  const user = useUserStore((s) => s.user);
  const authModalOpen = useUserStore((s) => s.authModalOpen);
  const setAuthModalOpen = useUserStore((s) => s.setAuthModalOpen);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userMenuOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [userMenuOpen]);

  async function handleSignOut() {
    setUserMenuOpen(false);
    await signOut();
    useUserStore.getState().setUser(null);
    useUserStore.getState().loadUser();
  }

  const isAnonymous = user?.is_anonymous ?? false;
  const userLabel = isAnonymous ? "anonyme" : (user?.email?.split("@")[0] ?? "connecté");
  const isProfileActive = pathname === "/profile";

  return (
    <>
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[--border] bg-[--surface]/95 backdrop-blur-sm">
        <div className="flex items-center h-14 max-w-lg mx-auto px-2">
          {/* Nav links */}
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2 border-t-2 transition-colors duration-150 ${
                  isActive ? "border-accent" : "border-transparent"
                }`}
              >
                <Icon
                  weight={isActive ? "fill" : "regular"}
                  className={`h-5 w-5 transition-colors duration-150 ${
                    isActive ? "text-accent" : "text-[--text-muted]"
                  }`}
                />
                <span className={`text-[10px] tracking-widest uppercase transition-colors duration-150 ${
                  isActive ? "text-accent" : "text-[--text-muted]"
                }`}>
                  {label}
                </span>
              </Link>
            );
          })}

          {/* Profile tab */}
          <div ref={menuRef} className="relative flex flex-1 flex-col items-center">
            <button
              onClick={() => user ? setUserMenuOpen((o) => !o) : setAuthModalOpen(true)}
              className={`flex flex-col items-center gap-0.5 w-full py-2 border-t-2 transition-colors duration-150 ${
                isProfileActive ? "border-accent" : "border-transparent"
              }`}
            >
              <UserCircle
                weight={isProfileActive ? "fill" : "regular"}
                className={`h-5 w-5 transition-colors duration-150 ${
                  isProfileActive ? "text-accent" : "text-[--text-muted]"
                }`}
              />
              <span className={`text-[10px] tracking-widest uppercase transition-colors duration-150 ${
                isProfileActive ? "text-accent" : "text-[--text-muted]"
              }`}>
                PROFIL
              </span>
            </button>

            {/* User menu dropdown */}
            {userMenuOpen && user && (
              <div className="absolute bottom-full mb-1 right-0 w-48 rounded-lg bg-[--surface] border border-[--border] shadow-xl overflow-hidden">
                <div className="px-3 py-2.5 border-b border-[--border]">
                  <p className="text-[10px] text-[--text-muted] uppercase tracking-widest mb-0.5">connecté</p>
                  <p className="text-sm text-[--text] truncate">{userLabel}</p>
                </div>
                {isAnonymous && (
                  <button
                    onClick={() => { setUserMenuOpen(false); setAuthModalOpen(true); }}
                    className="w-full text-left px-3 py-2.5 text-xs text-accent hover:bg-[--surface-2] transition-colors duration-150"
                  >
                    lier un email →
                  </button>
                )}
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2.5 text-xs text-[--text-muted] hover:text-danger hover:bg-danger/5 transition-colors duration-150"
                >
                  déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

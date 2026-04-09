import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import type { ScanStatus } from "@/lib/types/scan";

interface UserState {
  user: User | null;
  scans: Record<string, ScanStatus>; // invaderId → scanStatus
  isLoading: boolean;
  authModalOpen: boolean;

  loadUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  setScan: (invaderId: string, status: ScanStatus) => void;
  removeScan: (invaderId: string) => void;
  setAuthModalOpen: (open: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  scans: {},
  isLoading: true,
  authModalOpen: false,

  loadUser: async () => {
    set({ isLoading: true });

    // Lazy import to avoid importing browser client at module level (SSR safety)
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      set({ user: null, scans: {}, isLoading: false });
      return;
    }

    const { data } = await supabase
      .from("user_scans")
      .select("invader_id, scan_status")
      .eq("user_id", user.id);

    const scans: Record<string, ScanStatus> = {};
    data?.forEach((row) => {
      scans[row.invader_id] = row.scan_status as ScanStatus;
    });

    set({ user, scans, isLoading: false });
  },

  setUser: (user) => set({ user }),

  setScan: (invaderId, status) =>
    set((state) => ({ scans: { ...state.scans, [invaderId]: status } })),

  removeScan: (invaderId) =>
    set((state) => {
      const scans = { ...state.scans };
      delete scans[invaderId];
      return { scans };
    }),

  setAuthModalOpen: (open) => set({ authModalOpen: open }),
}));

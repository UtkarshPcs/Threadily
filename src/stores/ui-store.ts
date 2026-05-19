import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  sidebarTab: 'drafts' | 'templates' | 'ideas' | 'analytics' | 'settings';
  showPublishModal: boolean;
  showPinModal: boolean;
  toggleSidebar: () => void;
  setSidebarTab: (tab: UIState['sidebarTab']) => void;
  setShowPublishModal: (show: boolean) => void;
  setShowPinModal: (show: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  sidebarTab: 'drafts',
  showPublishModal: false,
  showPinModal: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  setShowPublishModal: (show) => set({ showPublishModal: show }),
  setShowPinModal: (show) => set({ showPinModal: show }),
}));

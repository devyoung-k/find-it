import { create } from 'zustand';

interface SearchStoreState {
  keyword: string;
  setKeyword: (value: string) => void;
}

const useSearchStore = create<SearchStoreState>((set) => ({
  keyword: '',
  setKeyword: (value) => set({ keyword: value })
}));

export default useSearchStore;

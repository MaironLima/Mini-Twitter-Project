import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "dark" | "light";

const getInitialTheme = (): Theme =>
  (localStorage.getItem("theme") as Theme) === "dark" ? "dark" : "light";

const getInitialAccessToken = (): string =>
  localStorage.getItem("accessToken") || "";

const getInitialId = (): number =>
  Number(localStorage.getItem("id")) || -1;

interface TokenState {
  themeStore: Theme;
  setThemeStore: (theme: Theme) => void;

  accessToken: string;
  setAccessToken: (token: string) => void;

  currentId: number;
  setCurrentId: (id: number) => void;

  update: boolean;
  setUpdate: () => void;

  searchTerm: string;
  setSearchTerm: (term: string) => void;

  likedPosts: Record<number, boolean>;
  setPostLiked: (postId: number, liked: boolean) => void;

  clearAuth: () => void;
}

export const useStore = create<TokenState>()(
  persist(
    (set) => ({
      themeStore: getInitialTheme(),
      setThemeStore: (theme) => {
        const newTheme = theme === "light" ? "dark" : "light";
        localStorage.setItem("theme", newTheme);
        set({ themeStore: newTheme });
      },

      accessToken: getInitialAccessToken(),
      setAccessToken: (token) => {
        set({ accessToken: token });
        localStorage.setItem("accessToken", token);
      },

      currentId: getInitialId(),
      setCurrentId: (id) => {
        set({ currentId: id });
        localStorage.setItem("id", `${id}`);
      },

      update: false,
      setUpdate: () => set((state) => ({ update: !state.update })),

      searchTerm: "",
      setSearchTerm: (term: string) => set({ searchTerm: term }),

      likedPosts: {},
      setPostLiked: (postId, liked) =>
        set((state) => ({
          likedPosts: { ...state.likedPosts, [postId]: liked },
        })),

      clearAuth: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("id");
        set({ accessToken: "", currentId: -1 });
      },
    }),
    {
      name: "app-storage",
      partialize: (state) => ({ likedPosts: state.likedPosts }),
    }
  )
);
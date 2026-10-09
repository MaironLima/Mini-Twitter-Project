import { Sun, Moon } from 'lucide-react';
import { useStore } from '../store/store';

function ThemeToggle() {
  const theme = useStore((state) => state.themeStore);
  const setThemeStore = useStore((state) => state.setThemeStore);

  const toggleTheme = () => {
    setThemeStore(theme);
  };

  return (
    <button
      className="global-main-btn w-[32px] h-[32px]"
      onClick={toggleTheme}
    >
      {theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

export default ThemeToggle;

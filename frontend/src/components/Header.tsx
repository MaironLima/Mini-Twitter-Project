import { useMutation } from "@tanstack/react-query";
import { useStore } from "../store/store";
import ThemeToggle from "./ThemeToggle";
import { LogOut, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Header() {
  const { accessToken, setSearchTerm, clearAuth, setUpdate } = useStore();
  const auth = accessToken !== "";

  const navigate = useNavigate();

  const { mutate: sendLogout } = useMutation({
    mutationFn: async () => {
      await api.post(
        "/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
    },
    onSuccess: () => {
      clearAuth()
      setUpdate()
    },
    onError: (err: { response?: { status?: number } }) => {
      if (err?.response?.status === 401) clearAuth();
    },
  });

  function onLogout() {
    sendLogout();
  }

  function toAuth(register: boolean) {
    if (register) {
      localStorage.setItem("register", "register");
    }
    navigate("/auth");
  }

  return (
    <header className="global-header-bg fixed top-0 left-0 w-full h-[50px] flex items-center border-b global-border px-4 z-50">
      <div className="absolute left-4 top-0 h-full flex items-center">
        <h3 className="global-title text-[15px]">Mini Twitter</h3>
      </div>

      <div className="flex-1 flex justify-center items-center">
        <div className="relative">
          <span className="global-icon absolute left-3 top-5.5 -translate-y-1/2 pointer-events-none">
            <Search size={18} />
          </span>
          <input
            className="global-input flex-none px-0 py-0 pl-10 pr-0 mt-0 mb-0 ml-0 mr-0 w-[300px] h-9 text-left rounded-xl"
            placeholder="Buscar por post..."
            type="text"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <ThemeToggle />
        <div className="flex items-center gap-2">
          {auth ? (
            <>
              <button
                onClick={onLogout}
                className="global-main-btn w-[32px] h-[32px]"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => toAuth(true)}
                className="global-alternative-btn w-[140px] h-[32px] border global-alternative-border font-semibold"
              >
                Registrar-se
              </button>
              <button
                onClick={() => toAuth(false)}
                className="global-btn w-[140px] h-[32px]"
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;

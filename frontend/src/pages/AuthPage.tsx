import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import api from "../services/api";
import { useStore } from "../store/store";
import { Mail, Eye, EyeOff, UserRound } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "../components/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserLoginFormSchema,
  UserRegisterFormSchema,
  type LoginData,
  type RegisterData,
} from "../schema/userSchema";
import { AxiosError } from "axios";

type ApiError = {
  error?: string;
  message?: string;
  details?: Array<{ field?: string; message?: string }>;
};

function AuthPage() {
  const [seePassword, setSeePassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logOrReg, setLogOrReg] = useState<string>(() => {
    if (localStorage.getItem("register") === "register") {
      localStorage.removeItem("register");
      return "register";
    }
    return "login";
  });

  const navigate = useNavigate();
  const isRegister = logOrReg === "register";

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const getErrorMessage = (error: AxiosError<ApiError>) => {
    const respData = error.response?.data;
    return (
      respData?.details?.[0]?.message ||
      respData?.error ||
      respData?.message ||
      error.message ||
      "Ocorreu um erro."
    );
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData | RegisterData>({
    resolver: zodResolver(
      isRegister ? UserRegisterFormSchema : UserLoginFormSchema,
    ),
    defaultValues: isRegister
      ? { name: "", email: "", password: "" }
      : { email: "", password: "" },
  });

  const { mutate: sendLogin } = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await api.post("/auth/login", data);
      return response.data;
    },
    onSuccess: (data) => {
      const { setAccessToken, setCurrentId } = useStore.getState();
      setAccessToken(data.token);
      setCurrentId(data.user.id);
      navigate("/");
    },
    onError: (error: AxiosError<ApiError>) => {
      showError(getErrorMessage(error));
    },
  });

  const { mutate: sendRegister } = useMutation({
    mutationFn: async (data: RegisterData) => {
      await api.post("/auth/register", data);
    },
    onSuccess: (_, variables) => {
      sendLogin({
        email: variables.email,
        password: variables.password,
      });
    },
    onError: (error: AxiosError<ApiError>) => {
      showError(getErrorMessage(error));
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="flex flex-col items-center w-full max-w-md">
        <h1 className="global-title mb-10">Mini Twitter</h1>

        <div className="border-b global-border">
          <button
            onClick={() => setLogOrReg("login")}
            className={`${
              logOrReg == "login"
                ? "global-auth-active"
                : "global-auth-unactive"
            }`}
            type="button"
          >
            Login
          </button>

          <button
            onClick={() => setLogOrReg("register")}
            className={`${
              logOrReg == "register"
                ? "global-auth-active"
                : "global-auth-unactive"
            }`}
            type="button"
          >
            Cadastrar
          </button>
        </div>

        {logOrReg == "login" && (
          <>
            <h2 className="text-2xl mb-0 mt-9 -translate-x-29 global-title">
              Olá, de novo!
            </h2>
            <p className="mt-0 -translate-x-10 text-sm global-subtitle">
              Por favor, insira os seus dados para fazer login
            </p>

            <div className="mt-8">
              <form
                onSubmit={handleSubmit((data) =>
                  sendLogin({ email: data.email, password: data.password }),
                )}
              >
                <div className="flex flex-col gap-4">
                  <label className="global-extra flex flex-col">
                    E-mail
                    <div className="relative">
                      <input
                        {...register("email")}
                        placeholder="Insira o seu e-mail"
                        className="global-input"
                        autoComplete="email"
                      />
                      <Mail
                        className="global-icon pointer-events-none -translate-y-[8px]"
                        size={20}
                      />
                    </div>
                    {errors.email && (
                      <span className="text-red-500 text-xs mt-1">
                        {errors.email.message as string}
                      </span>
                    )}
                  </label>

                  <label className="global-extra flex flex-col">
                    Senha
                    <div className="relative">
                      <input
                        {...register("password")}
                        placeholder="Insira a sua senha"
                        className="global-input"
                        autoComplete="off"
                        type={seePassword ? "text" : "password"}
                      />
                      <button
                        type="button"
                        onClick={() => setSeePassword((prev) => !prev)}
                        className="global-icon cursor-pointer hover:text-[#63758f] translate-x-2 -translate-y-[10px]"
                      >
                        {seePassword ? <Eye /> : <EyeOff />}
                      </button>
                    </div>
                    {errors.password && (
                      <span className="text-red-500 text-xs mt-1">
                        {errors.password.message as string}
                      </span>
                    )}
                  </label>
                </div>

                <div className="flex justify-center mt-10 flex-col items-center">
                  <div className="relative w-fit">
                    <div className="global-btn-blur px-20 py-2 inset-0"></div>
                    <button
                      className="global-btn px-41 py-5 text-[17px] font-semibold relative z-10"
                      type="submit"
                    >
                      Continuar
                    </button>
                  </div>
                  {errorMessage && (
                    <span className="text-red-500 text-xs mt-1 self-center">
                      <span className="font-semibold">{errorMessage}</span>
                    </span>
                  )}
                </div>
              </form>
            </div>
          </>
        )}

        {logOrReg == "register" && (
          <>
            <h2 className="text-2xl mb-0 mt-9 -translate-x-16 global-title">
              Olá, vamos começar!
            </h2>
            <p className="mt-0 -translate-x-6 text-sm global-subtitle">
              Por favor, insira os seus dados para fazer cadastrar
            </p>

            <div className="mt-8">
              <form
                onSubmit={handleSubmit((data) =>
                  sendRegister({
                    name: (data as RegisterData).name,
                    email: data.email,
                    password: data.password,
                  }),
                )}
              >
                <div className="flex flex-col gap-4">
                  <label className="global-extra flex flex-col">
                    Nome
                    <div className="relative">
                      <input
                        {...register("name")}
                        placeholder="Insira o seu nome"
                        className="global-input"
                        autoComplete="off"
                      />
                      <UserRound
                        className="global-icon pointer-events-none -translate-y-[8px]"
                        size={20}
                      />
                    </div>
                    {"name" in errors && errors.name && (
                      <span className="text-red-500 text-xs mt-1">
                        {errors.name.message as string}
                      </span>
                    )}
                  </label>

                  <label className="global-extra flex flex-col">
                    E-mail
                    <div className="relative">
                      <input
                        {...register("email")}
                        placeholder="Insira o seu e-mail"
                        className="global-input"
                        autoComplete="off"
                      />
                      <Mail
                        className="global-icon pointer-events-none -translate-y-[8px]"
                        size={20}
                      />
                    </div>
                    {errors.email && (
                      <span className="text-red-500 text-xs mt-1">
                        {errors.email.message as string}
                      </span>
                    )}
                  </label>

                  <label className="global-extra flex flex-col">
                    Senha
                    <div className="relative">
                      <input
                        {...register("password")}
                        placeholder="Insira a sua senha"
                        className="global-input"
                        autoComplete="off"
                        type={seePassword ? "text" : "password"}
                      />
                      <button
                        type="button"
                        onClick={() => setSeePassword((prev) => !prev)}
                        className="global-icon cursor-pointer hover:text-[#63758f] translate-x-2 -translate-y-[10px]"
                      >
                        {seePassword ? <Eye /> : <EyeOff />}
                      </button>
                    </div>
                    {errors.password && (
                      <span className="text-red-500 text-xs mt-1">
                        {errors.password.message as string}
                      </span>
                    )}
                  </label>
                </div>

                <div className="flex flex-col justify-center items-center mt-10">
                  <div className="relative w-fit">
                    <button
                      className="global-btn px-41 py-5 text-[17px] font-semibold"
                      type="submit"
                    >
                      Continuar
                    </button>
                  </div>
                  {errorMessage && (
                    <span className="text-red-500 text-xs mt-1 self-center">
                      <span className="font-semibold">{errorMessage}</span>
                    </span>
                  )}
                </div>
              </form>
            </div>
          </>
        )}

        <div className="tracking-tighter text-[#717e91] text-xs mt-10">
          <p className="text-center">
            Ao clicar em continuar, você concorda com nossos
          </p>
          <p className="text-center -translate-y-3">
            <button className="cursor-pointer tracking-tight underline text-xs text-[#717e91] bg-transparent border-none">
              Termos de Serviço
            </button>{" "}
            e{" "}
            <button className="cursor-pointer tracking-tight text-xs underline text-[#717e91] bg-transparent border-none">
              Política de Privacidade
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;

import { z } from "zod";

export const UserRegisterFormSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export const UserLoginFormSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export type RegisterData = z.infer<typeof UserRegisterFormSchema>;
export type LoginData = z.infer<typeof UserLoginFormSchema>;

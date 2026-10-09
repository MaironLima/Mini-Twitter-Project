import { z } from "zod";

export const UserRegisterFormSchema = z.object({
  title: z.string().min(3, "Titulo deve ter pelo menos 3 caracteres"),
  content: z.email("O Texto deve ter pelo menos 3 caracteres"),
});
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

/** Handler de Better Auth (login, registro, sesión, admin, etc.). */
export const { POST, GET } = toNextJsHandler(auth);

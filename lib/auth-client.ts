"use client";

import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

/** Cliente de Better Auth para componentes de cliente. */
export const authClient = createAuthClient({
  plugins: [adminClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;

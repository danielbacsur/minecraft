import { createAuthClient } from "better-auth/react";
import {
  anonymousClient,
  customSessionClient,
  lastLoginMethodClient,
} from "better-auth/client/plugins";

import type { auth as server } from "./server";

export const auth = createAuthClient({
  plugins: [
    anonymousClient(),
    customSessionClient<typeof server>(),
    lastLoginMethodClient(),
  ],
});

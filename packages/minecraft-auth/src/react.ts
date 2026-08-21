import { createAuthClient } from "better-auth/react";
import {
  anonymousClient,
  lastLoginMethodClient,
} from "better-auth/client/plugins";

export const auth = createAuthClient({
  plugins: [anonymousClient(), lastLoginMethodClient()],
});

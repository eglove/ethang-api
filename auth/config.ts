import { secret } from "encore.dev/config";

export const CLERK_SECRET = secret("CLERK_SECRET_KEY");
export const CLERK_PUBLIC_JWT = secret("CLERK_PUBLIC_JWT");

export const AUTHORIZED_PARTIES = [
  "http://localhost:4000",
  "http://localhost:4321",
];

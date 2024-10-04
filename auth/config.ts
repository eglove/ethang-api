import { secret } from "encore.dev/config";

export const DOMAIN = secret("CLERK_DOMAIN");
export const CLERK_SECRET = secret("CLERK_SECRET_KEY");

export const AUTHORIZED_PARTIES = [
    "http://localhost:4000",
    "http://localhost:4321",
];
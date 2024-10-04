import { secret } from "encore.dev/config";

export const DOMAIN = secret("CLERK_DOMAIN");

export const AUTHORIZED_PARTIES = [
    "http://localhost:4000",
];
import {secret} from "encore.dev/config";
import {createClerkClient, verifyToken} from "@clerk/backend";
import {APIError, Gateway, Header} from "encore.dev/api";
import {AUTHORIZED_PARTIES, DOMAIN} from "./config";
import {authHandler} from "encore.dev/auth";
import log from "encore.dev/log";

const clerkSecretKey = secret("CLERK_SECRET_KEY");

const clerkClient = createClerkClient({
    secretKey: clerkSecretKey.toString(),
})

type AuthParams = {
    authorization: Header<"Authorization">
}

type AuthData = {
    userID: string;
    imageUrl: string;
    emailAddress: string | null;
}

export const auth = authHandler(
    async (params: AuthParams): Promise<AuthData> => {
        const token = params.authorization.replace('Bearer ', '');

        if (!token) {
            throw APIError.unauthenticated("no token provided");
        }

        try {
            const result = await verifyToken(token, {
                // @ts-ignore
                issuer: DOMAIN,
                authorizedParties: AUTHORIZED_PARTIES,
            });

            const user = await clerkClient.users.getUser(result.sub);

            return {
                userID: user.id,
                imageUrl: user.imageUrl,
                emailAddress: user.emailAddresses[0].emailAddress || null,
            };
        } catch (e) {
            log.error(e);
            throw APIError.unauthenticated("invalid token", e as Error);
        }
    }
);

export const gateway = new Gateway({authHandler: auth});
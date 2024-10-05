import {createClerkClient, verifyToken} from "@clerk/backend";
import {APIError, Gateway, Header} from "encore.dev/api";
import {AUTHORIZED_PARTIES, CLERK_PUBLIC_JWT, CLERK_SECRET} from "./config";
import {authHandler} from "encore.dev/auth";
import log from "encore.dev/log";

const clerkClient = createClerkClient({
    secretKey: CLERK_SECRET(),
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
                secretKey: CLERK_SECRET(),
                jwtKey: CLERK_PUBLIC_JWT(),
                authorizedParties: AUTHORIZED_PARTIES,
            }) as {sub: string};

            const user = await clerkClient.users.getUser(result.sub);

            return {
                userID: user.id,
                imageUrl: user.imageUrl,
                emailAddress: user.emailAddresses[0].emailAddress || null,
            };
        } catch (e) {
            console.error(e)
            log.error(e);
            throw APIError.unauthenticated("invalid token", e as Error);
        }
    }
);

export const gateway = new Gateway({authHandler: auth});
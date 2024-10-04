import {createClerkClient, verifyToken} from "@clerk/backend";
import {APIError, Gateway, Header} from "encore.dev/api";
import {AUTHORIZED_PARTIES, CLERK_SECRET} from "./config";
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
                jwtKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwBGt8hLbIRGIZwxuCz4/
c8h9ayclJa18VRZq+IifjdottnRitMQG/C3O/N6/U0pHSMi61TyEa3/DY67/JbiN
lUpVYtHrhD9EqlaLmy9TlchXSx3vrR28G/AW5EPOfOGX1Qy+wpQYVNkNYxW5CEQV
CcfhYdcPhMsJbaTRes2I4z68J/BfoQ4Rg3eWJ3TKZSwmTgbIDn0Am+g2uFFkl6pr
Woe/GOoImUHJ0duS1+GJMxffWTzW4ilxc4zYeu8pLPPVahufHEr2P9SFITBq8kHr
IH4wj8lLKyitlCkvzfO/Oy+5YEg1BQfUVslRUyaHWO9JqDvqmyExnjoNitmpY4dE
KwIDAQAB
-----END PUBLIC KEY-----
`,
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
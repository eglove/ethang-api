import { createClerkClient, verifyToken } from "@clerk/backend";
import { APIError, Gateway, type Header } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import log from "encore.dev/log";
import replace from "lodash/replace";

import { AUTHORIZED_PARTIES, CLERK_PUBLIC_JWT, CLERK_SECRET } from "./config";

const clerkClient = createClerkClient({
  secretKey: CLERK_SECRET(),
});

type AuthParameters = {
  authorization: Header<"Authorization">;
};

type AuthData = {
  emailAddress: null | string;
  imageUrl: string;
  userID: string;
};

export const auth = authHandler(
  async (parameters: AuthParameters): Promise<AuthData> => {
    const token = replace(parameters.authorization, "Bearer ", "");

    if (!token) {
      throw APIError.unauthenticated("no token provided");
    }

    try {
      const result = await verifyToken(token, {
        authorizedParties: AUTHORIZED_PARTIES,
        jwtKey: CLERK_PUBLIC_JWT(),
        secretKey: CLERK_SECRET(),
      }) as { sub: string };

      const user = await clerkClient.users.getUser(result.sub);

      return {
        emailAddress: user.emailAddresses[0].emailAddress || null,
        imageUrl: user.imageUrl,
        userID: user.id,
      };
    } catch (error) {
      log.error(error);
      throw APIError.unauthenticated("invalid token", error as Error);
    }
  },
);

export const gateway = new Gateway({ authHandler: auth });

import { neon } from "@neondatabase/serverless";
import { api } from "encore.dev/api";

import { DATABASE_URL } from "./config";

type Certification = {
  createdAt: string;
  description: string;
  expires?: string;
  id: string;
  issuedBy: string;
  issuedOn: string;
  name: string;
  updatedAt: string;
  url: string;
};

export const get = api({
  expose: true,
  method: "GET",
  path: "/certification",
}, async (): Promise<{
  count: number;
  data: Certification[];
}> => {
  const neonSql = neon(DATABASE_URL());
  const data = await neonSql`
    select * from "Certification"
    order by "issuedOn" DESC
  ` as unknown as Certification[];

  return {
    count: data.length,
    data,
  };
});

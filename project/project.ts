import { neon } from "@neondatabase/serverless";
import { api } from "encore.dev/api";

import { serialize } from "../utils/json";
import { DATABASE_URL } from "./config";

type Project = {
  createdAt: string;
  description: string;
  id: string;
  name: string;
  updatedAt: string;
  url: string;
};


export const get = api({
  expose: true,
  method: "GET",
  path: "/project",
}, async (): Promise<{
  count: number;
  data: Project[];
}> => {
  const neonSql = neon(DATABASE_URL());
  const projects = await neonSql`SELECT * FROM "Project" order by "name"` as unknown as Project[];

  return {
    count: projects.length,
    data: serialize(projects),
  };
});

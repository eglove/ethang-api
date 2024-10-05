import { adder } from "@ethang/toolbelt/number/adder.js";
import { neon } from "@neondatabase/serverless";
import { api } from "encore.dev/api";
import forEach from "lodash/forEach.js";
import { default as lodashGet } from "lodash/get.js";
import isNil from "lodash/isNil.js";
import set from "lodash/set.js";
import values from "lodash/values.js";
// eslint-disable-next-line barrel/avoid-importing-barrel-files
import { DateTime } from "luxon";

import { DATABASE_URL } from "./config";

type Job = {
  company: string;
  createdAt: string;
  descriptionBullets: string[];
  endDate: null | string;
  id: string;
  methodologiesUsed: string[];
  shortDescription: string;
  startDate: string;
  techUsed: string[];
  title: string;
  updatedAt: string;
};

type Response<T,> = {
  count?: number;
  data: T;
};

export const get = api(
  {
    expose: true,
    method: "GET",
    path: "/jobs",
  },
  async (): Promise<Response<Job[]>> => {
    const neonSql = neon(DATABASE_URL());
    const jobs = await neonSql`select * from "Job"` as Job[];

    return {
      count: jobs.length,
      data: jobs,
    };
  },
);

type ExperiencesReturn = {
  max: number;
  skills: Record<string, number>;
};

export const experience = api({
  expose: true,
  method: "GET",
  path: "/jobs/experience",
}, async (): Promise<ExperiencesReturn> => {
  const neonSql = neon(DATABASE_URL());
  const jobs = await neonSql`select * from "Job"` as Job[];

  const experiences: Record<string, number> = {};

  forEach(jobs, (job) => {
    const start = DateTime.fromJSDate(new Date(job.startDate));
    const end = isNil(job.endDate)
      ? DateTime.now().setZone("America/Chicago")
      : DateTime.fromJSDate(new Date(job.endDate));
    const diff = end.diff(start, "years");

    forEach(job.techUsed, (skill) => {
      const current = lodashGet(experiences, [skill], 0);
      set(
        experiences,
        [skill],
        Number(adder([String(current), String(diff.years)])),
      );
    });
  });

  const max = Math.max(...values(experiences));

  return {
    max,
    skills: experiences,
  };
});

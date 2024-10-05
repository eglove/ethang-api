import { TZDate } from "@date-fns/tz";
import { adder } from "@ethang/toolbelt/number/adder.js";
import { neon } from "@neondatabase/serverless";
import { differenceInYears, parseISO } from "date-fns";
import { api } from "encore.dev/api";
import forEach from "lodash/forEach.js";
import fromPairs from "lodash/fromPairs.js";
import { default as lodashGet } from "lodash/get.js";
import isNil from "lodash/isNil.js";
import reverse from "lodash/reverse.js";
import set from "lodash/set.js";
import sortBy from "lodash/sortBy.js";
import toPairs from "lodash/toPairs.js";
import values from "lodash/values.js";

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
    const start = parseISO(job.startDate);
    const end = isNil(job.endDate)
      ? TZDate.tz("America/Chicago", new Date())
      : parseISO(job.endDate);
    const diff = differenceInYears(start, end);

    forEach(job.techUsed, (skill) => {
      const current = lodashGet(experiences, [skill], 0);
      set(experiences, [skill], Number(adder([String(current), String(diff)])));
    });
  });

  const sorted = fromPairs(reverse(sortBy(toPairs(experiences), [1])));
  const max = Math.max(...values(experiences));

  return {
    max,
    skills: sorted,
  };
});

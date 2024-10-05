import { TZDate } from "@date-fns/tz";
import { adder } from "@ethang/toolbelt/number/adder";
import { PrismaClient } from "@prisma/client";
import { differenceInYears, parseISO } from "date-fns";
import { api } from "encore.dev/api";
import forEach from "lodash/forEach.js";
import fromPairs from "lodash/fromPairs.js";
import { default as lodashGet } from "lodash/get.js";
import isNil from "lodash/isNil.js";
import map from "lodash/map.js";
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
    auth: true,
    expose: true,
    method: "GET",
    path: "/jobs",
  },
  async (): Promise<Response<Job[]>> => {
    const prisma = new PrismaClient({ datasourceUrl: DATABASE_URL() });
    const jobs = await prisma.job.findMany();
    const serialized = map(jobs, (job) => {
      return {
        ...job,
        createdAt: job.createdAt.toISOString(),
        endDate: job.endDate?.toISOString() ?? null,
        startDate: job.startDate.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
      };
    });

    return {
      count: jobs.length,
      data: serialized,
    };
  },
);

type ExperiencesReturn = {
  max: number;
  skills: Record<string, number>;
};

export const experience = api({
  auth: true,
  expose: true,
  method: "GET",
  path: "/jobs/experience",
}, async (): Promise<ExperiencesReturn> => {
  const prisma = new PrismaClient({ datasourceUrl: DATABASE_URL() });
  const jobs = await prisma.job.findMany();

  const experiences: Record<string, number> = {};

  forEach(jobs, (job) => {
    const start = parseISO(job.startDate.toISOString());
    const end = isNil(job.endDate)
      ? TZDate.tz("America/Chicago", new Date())
      : parseISO(job.endDate.toISOString());
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

import {api} from "encore.dev/api";
import {PrismaClient} from "@prisma/client";
import {DATABASE_URL} from "./config";

type Job = {
    id: string;
    createdAt: string;
    updatedAt: string;
    title: string;
    company: string;
    startDate: string;
    endDate: string | null;
    shortDescription: string;
    techUsed: string[];
    methodologiesUsed: string[];
    descriptionBullets: string[];
}

type Response<T> = {
    data: T,
    count?: number
}

export const get = api(
    {expose: true, auth: true, method: "GET", path: "/jobs"},
    async (): Promise<Response<Job[]>> => {
        const prisma = new PrismaClient({datasourceUrl: DATABASE_URL()});
        const jobs = await prisma.job.findMany();
        const serialized = jobs.map(job => {
            return {
                ...job,
                createdAt: job.createdAt.toISOString(),
                updatedAt: job.updatedAt.toISOString(),
                startDate: job.startDate.toISOString(),
                endDate: job.endDate?.toISOString() ?? null,
            }
        })

        return {data: serialized, count: jobs.length}
    }
)
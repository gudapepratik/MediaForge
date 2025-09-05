// import {PrismaClient} from "../../generated/prisma/index.js"
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL
})

export const connectDB = async () => {
    try {
        console.log(process.env.DATABASE_URL)
        await prisma.$connect();
        console.log("Postgres connected successfully")
    } catch (error) {
        console.log("Error while connecting to Postgres..",error)
        exit(1);
    }
}
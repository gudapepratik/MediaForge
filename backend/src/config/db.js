import {PrismaClient} from "../../generated/prisma/index.js"

export const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL
})

export const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("Postgres connected successfully")
    } catch (error) {
        console.log("Error while connecting to Postgres..")
        exit(1);
    }
}
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client.ts";
import { env } from "../infra/env.js";

const parsedDatabaseUrl = new URL(env.databaseUrl);
const databaseName = decodeURIComponent(parsedDatabaseUrl.pathname.slice(1));

const adapter = new PrismaMariaDb({
  host: parsedDatabaseUrl.hostname,
  port: Number(parsedDatabaseUrl.port || 3306),
  user: decodeURIComponent(parsedDatabaseUrl.username),
  password: decodeURIComponent(parsedDatabaseUrl.password),
  database: databaseName,
  connectionLimit: 5,
});

export const prisma = new PrismaClient({ adapter });

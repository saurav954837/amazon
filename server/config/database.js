import mysql from "mysql2/promise.js";
import dotenv from "dotenv";

dotenv.config();

export const db_config = mysql.createPool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 100,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    idleTimeout: 60000,
    connectionTimeout: 10000,
    timezone: '+00:00',
    charset: 'utf8mb4',
    dateStrings: true
});
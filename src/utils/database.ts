import { Pool } from 'pg';
import logger from './logger';

import dotenv from 'dotenv';

dotenv.config();

export namespace PostgresDB {
    const pool = new Pool({
        user: process.env.PG_USER, // Cambia esto por tu usuario de PostgreSQL
        host: process.env.PG_HOST, // Cambia esto si tu base de datos no está en localhost
        database: process.env.PG_DATABASE, // Nombre de tu base de datos
        password: `${process.env.PG_PASSWORD}`, // Contraseña de tu usuario
        port: Number(process.env.PG_PORT) || 5432, // Puerto de PostgreSQL (por defecto es 5432)
    });

    logger.info('Connecting to PostgreSQL database...');

    export const query = (text: string, params?: any[]) => pool.query(text, params);
}
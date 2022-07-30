import pg from 'pg';
const Pool = pg.Pool;

const pool = new Pool({ max: 200 });

const getPool = function() {
    return pool;
}

export const Database = {
    getPool
}
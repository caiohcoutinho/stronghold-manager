import pg from 'pg';
const Pool = pg.Pool;

let pool = new Pool({ max: 200 });

const getPool = function() {
    return pool;
}

const setPool = function(newPool) {
    pool = newPool;
}

export const Database = {
    getPool,
    setPool
}
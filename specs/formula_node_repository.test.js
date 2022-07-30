import { newDb } from "pg-mem";
import _ from '../server/repository/commons/UnderscoreMixin.mjs';
import fs from 'fs';
import { FormulaNodeRepository } from '../server/repository/recipe/formula_node_repository.mjs';
import Logger from '../server/repository/commons/LogCommons.mjs';

import Path from 'path';

let global = null;

const db = newDb();
const { Pool } = db.adapters.createPg();
const pool = new Pool({ max: 200 });
let backup;

const logger = new Logger(true, 'formula_node_repository.test.js');

const insertStrongholdUser = async function(id, name, email, picture) {
    return await db.public.one("insert into stronghold_user(id, name, email, picture) values ('" + id + "','" + name + "', '" + email + "', '" + picture + "')");
}

const insertRecipe = async function(id, name, owner_id) {
    return await db.public.one("insert into recipe(id, name, owner_id) values ('" + id + "','" + name + "', '" + owner_id + "')");
}

const insertResource = async function(id, name, owner_id) {
    return await db.public.one("insert into resource(id, name, owner_id) values ('" + id + "','" + name + "', '" + owner_id + "')");
}

const insertGoofy = () => {
    insertStrongholdUser('goofy', 'Goofy Goofest', 'goofy@gmail.com', 'http://link.picture.com/goofy');
}

beforeAll(() => {
    let path = Path.resolve('./migrations');
    return new Promise(resolve => {
        fs.readdir(path, (err, fileNames) => {
            Promise.all(_.map(fileNames, (fileName) => {
                let filePath = Path.resolve('./migrations/' + fileName);
                return new Promise(resolveFile => {
                    fs.readFile(filePath, 'utf-8', (err, fileContent) => {
                        resolveFile(fileContent);
                    });
                });
            })).then(results => {
                let sql = _.reduce(results, (memo, fileContent) => {
                    return memo + '\n\n\n' + fileContent
                }, '');
                db.public.none(sql);
                backup = db.backup();
                resolve("ok");
            });
        });
    });
});

beforeEach(() => {
    backup.restore();
});

test('upsertFormula is defined', () => {
    expect(FormulaNodeRepository.upsertFormula).toBeDefined();
});

test('Simple recipe no formula', async() => {
    await FormulaNodeRepository.upsertFormula(pool, {
        id: '0',
        name: 'recipe'
    }, { sub: '0' });
});

test('Recipe add formula', async() => {
    const logLabel = 'Recipe add formula';
    insertGoofy();
    insertRecipe('0', 'recipe', 'goofy');
    insertResource('abcd1234', 'resource', 'goofy');
    let node = await FormulaNodeRepository.upsertFormula(pool, () => '12341234', {
        id: '0',
        name: 'recipe',
        formula: {
            node_id: '0',
            node_type: 'resource',
            parent_id: null,
            resource_id: 'abcd1234',
            quantity: null
        }
    }, { sub: 'goofy' });

    expect(node).toBeDefined();
    let node_id = node.node_id;
    expect(node_id).toBeDefined();

    let client = await pool.connect();
    let result = (await client.query("select * from formula_node where node_id = '" + node_id + "'")).rows;
    client.release();
    expect(result).toBeDefined();

    logger.logDebug("formula_node's = " + JSON.stringify(result));
    expect(_.size(result)).toBe(1);

    let dbRow = result[0];
    expect(_.isNullOrUndefined(dbRow)).toBe(false);
    expect(dbRow.node_id).toBe('12341234');
    expect(_.isNullOrUndefined(dbRow.parent_id)).toBe(true);
    expect(dbRow.owner_id).toBe('goofy');
    expect(dbRow.resource_id).toBe('abcd1234');
    expect(dbRow.node_type).toBe('resource');
    expect(_.isNullOrUndefined(dbRow.quantity)).toBe(true);
});

test('Recipe remove formula: empty object', async() => {
    const logLabel = 'Recipe remove formula test: empty object';
    insertGoofy();
    await insertRecipe('0', 'recipe', 'goofy');
    insertResource('abcd1234', 'resource', 'goofy');
    await FormulaNodeRepository.upsertFormula(pool, () => '12341234', {
        id: '0',
        name: 'recipe',
        formula: {
            node_id: '0',
            node_type: 'resource',
            parent_id: null,
            resource_id: 'abcd1234',
            quantity: null
        }
    }, { sub: 'goofy' });

    logger.logDebug("After first insert, checking setup.");

    let client = await pool.connect();
    let result = await client.query('select * from recipe');
    client.release();

    expect(_.isNullOrUndefined(result)).toBe(false);
    expect(_.isNullOrUndefined(result.rows)).toBe(false);

    let rows = result.rows;
    expect(_.isEmpty(rows)).toBe(false);
    expect(_.size(rows)).toBe(1);

    await FormulaNodeRepository.upsertFormula(pool, () => '12341234', {
        id: '0',
        name: 'recipe',
        formula: {}
    }, { sub: 'goofy' });

    client = await pool.connect();
    result = await client.query('select * from formula_node');
    client.release();
    expect(_.isNullOrUndefined(result)).toBe(false);
    rows = result.rows;
    expect(_.isEmpty(rows)).toBe(true);
});

test('Recipe remove formula: null object', async() => {
    const logLabel = 'Recipe remove formula test: null object';
    insertGoofy();
    await insertRecipe('0', 'recipe', 'goofy');
    insertResource('abcd1234', 'resource', 'goofy');
    await FormulaNodeRepository.upsertFormula(pool, () => '12341234', {
        id: '0',
        name: 'recipe',
        formula: {
            node_id: '0',
            node_type: 'resource',
            parent_id: null,
            resource_id: 'abcd1234',
            quantity: null
        }
    }, { sub: 'goofy' });

    logger.logDebug("After first insert, checking setup.");

    let client = await pool.connect();
    let result = await client.query('select * from recipe');
    client.release();

    expect(_.isNullOrUndefined(result)).toBe(false);
    expect(_.isNullOrUndefined(result.rows)).toBe(false);

    let rows = result.rows;
    expect(_.isEmpty(rows)).toBe(false);
    expect(_.size(rows)).toBe(1);

    await FormulaNodeRepository.upsertFormula(pool, () => '12341234', {
        id: '0',
        name: 'recipe',
        formula: null
    }, { sub: 'goofy' });

    client = await pool.connect();
    result = await client.query('select * from formula_node');
    client.release();
    expect(_.isNullOrUndefined(result)).toBe(false);
    rows = result.rows;
    expect(_.isEmpty(rows)).toBe(true);
});

test('Recipe update formula change node resource', async() => {
    const logLabel = 'Recipe update formula change node resource';
    insertGoofy();
    await insertRecipe('0', 'recipe', 'goofy');
    insertResource('abcd1234', 'resource', 'goofy');
    insertResource('abcd5678', 'resource2', 'goofy');
    await FormulaNodeRepository.upsertFormula(pool, () => '12341234', {
        id: '0',
        name: 'recipe',
        formula: {
            node_id: '0',
            node_type: 'resource',
            parent_id: null,
            resource_id: 'abcd1234',
            quantity: null
        }
    }, { sub: 'goofy' });

    logger.logDebug("After first insert, checking setup.");

    let client = await pool.connect();
    let result = await client.query('select * from recipe');
    client.release();

    expect(_.isNullOrUndefined(result)).toBe(false);
    expect(_.isNullOrUndefined(result.rows)).toBe(false);
    let rows = result.rows;
    expect(_.isEmpty(rows)).toBe(false);
    expect(_.size(rows)).toBe(1);

    let row = rows[0];
    expect(_.isNullOrUndefined(row)).toBe(false);
    expect(row.id).toBe('0');
    expect(row.formula_id).toBe('12341234');

    logger.logDebug('initial recipe created = ' + JSON.stringify(row));

    await FormulaNodeRepository.upsertFormula(pool, () => '12345678', {
        id: '0',
        name: 'recipe',
        formula: {
            node_id: '0',
            node_type: 'resource',
            parent_id: null,
            resource_id: 'abcd5678',
            quantity: null
        }
    }, { sub: 'goofy' });

    client = await pool.connect();
    result = await client.query('select * from formula_node');
    client.release();
    expect(_.isNullOrUndefined(result)).toBe(false);
    rows = result.rows;
    expect(_.isEmpty(rows)).toBe(false);
    expect(_.size(rows)).toBe(1);

    row = rows[0];
    expect(_.isNullOrUndefined(row)).toBe(false);
    expect(row.resource_id).toBe('abcd5678');

});

test('Recipe update formula change node type from resource to quantity', async() => {
    const logLabel = 'Recipe update formula change node type from resource to quantity';
    insertGoofy();
    await insertRecipe('0', 'recipe', 'goofy');
    insertResource('abcd1234', 'resource', 'goofy');
    insertResource('abcd5678', 'resource2', 'goofy');
    await FormulaNodeRepository.upsertFormula(pool, () => '12341234', {
        id: '0',
        name: 'recipe',
        formula: {
            node_id: '0',
            node_type: 'resource',
            parent_id: null,
            resource_id: 'abcd1234',
            quantity: null
        }
    }, { sub: 'goofy' });

    logger.logDebug("After first insert, checking setup.");

    let client = await pool.connect();
    let result = await client.query('select * from recipe');
    client.release();

    expect(_.isNullOrUndefined(result)).toBe(false);
    expect(_.isNullOrUndefined(result.rows)).toBe(false);
    let rows = result.rows;
    expect(_.isEmpty(rows)).toBe(false);
    expect(_.size(rows)).toBe(1);

    let row = rows[0];
    expect(_.isNullOrUndefined(row)).toBe(false);
    expect(row.id).toBe('0');
    expect(row.formula_id).toBe('12341234');

    logger.logDebug('initial recipe created = ' + JSON.stringify(row));

    await FormulaNodeRepository.upsertFormula(pool, () => '12345678', {
        id: '0',
        name: 'recipe',
        formula: {
            node_id: '0',
            node_type: 'quantity',
            parent_id: null,
            resource_id: null,
            quantity: 4
        }
    }, { sub: 'goofy' });

    client = await pool.connect();
    result = await client.query('select * from formula_node');
    client.release();
    expect(_.isNullOrUndefined(result)).toBe(false);
    rows = result.rows;
    expect(_.isEmpty(rows)).toBe(false);
    expect(_.size(rows)).toBe(1);

    row = rows[0];
    expect(_.isNullOrUndefined(row)).toBe(false);
    expect(_.isNullOrUndefined(row.parent_id)).toBe(true);
    expect(row.owner_id).toBe('goofy');
    expect(_.isNullOrUndefined(row.resource_id)).toBe(true);
    expect(row.node_type).toBe('quantity');
    expect(row.quantity).toBe(4);

});

test('Recipe update formula change quantity', async() => {
    const logLabel = 'Recipe update formula change quantity';
    insertGoofy();
    await insertRecipe('0', 'recipe', 'goofy');
    insertResource('abcd1234', 'resource', 'goofy');
    insertResource('abcd5678', 'resource2', 'goofy');
    await FormulaNodeRepository.upsertFormula(pool, () => '12341234', {
        id: '0',
        name: 'recipe',
        formula: {
            node_id: '0',
            node_type: 'quantity',
            parent_id: null,
            quantity: 3
        }
    }, { sub: 'goofy' });

    logger.logDebug("After first insert, checking setup.");

    let client = await pool.connect();
    let result = await client.query('select * from formula_node');
    client.release();

    expect(_.isNullOrUndefined(result)).toBe(false);
    expect(_.isNullOrUndefined(result.rows)).toBe(false);
    let rows = result.rows;
    expect(_.isEmpty(rows)).toBe(false);
    expect(_.size(rows)).toBe(1);

    let row = rows[0];
    expect(_.isNullOrUndefined(row)).toBe(false);
    expect(row.node_id).toBe('12341234');
    expect(row.quantity).toBe(3);

    logger.logDebug('initial recipe created = ' + JSON.stringify(row));

    await FormulaNodeRepository.upsertFormula(pool, () => '12345678', {
        id: '0',
        name: 'recipe',
        formula: {
            node_id: '0',
            node_type: 'quantity',
            parent_id: null,
            quantity: 4
        }
    }, { sub: 'goofy' });

    client = await pool.connect();
    result = await client.query('select * from formula_node');
    client.release();
    expect(_.isNullOrUndefined(result)).toBe(false);
    rows = result.rows;
    expect(_.isEmpty(rows)).toBe(false);
    expect(_.size(rows)).toBe(1);

    row = rows[0];
    expect(_.isNullOrUndefined(row)).toBe(false);
    expect(_.isNullOrUndefined(row.parent_id)).toBe(true);
    expect(row.owner_id).toBe('goofy');
    expect(_.isNullOrUndefined(row.resource_id)).toBe(true);
    expect(row.node_type).toBe('quantity');
    expect(row.quantity).toBe(4);

});

test('Recipe update formula change type from resource to AND and add children', async() => {
    const logLabel = 'Recipe update formula change type from resource to AND and add children';
    insertGoofy();
    await insertRecipe('0', 'recipe', 'goofy');
    insertResource('abcd1234', 'resource', 'goofy');
    insertResource('abcd5678', 'resource2', 'goofy');
    await FormulaNodeRepository.upsertFormula(pool, () => '12341234', {
        id: '0',
        name: 'recipe',
        formula: {
            node_id: '0',
            node_type: 'resource',
            parent_id: null,
            resource_id: 'abcd1234'
        }
    }, { sub: 'goofy' });

    logger.logDebug("After first insert, checking setup.");

    let client = await pool.connect();
    let result = await client.query('select * from formula_node');
    client.release();

    expect(_.isNullOrUndefined(result)).toBe(false);
    expect(_.isNullOrUndefined(result.rows)).toBe(false);
    let rows = result.rows;
    expect(_.isEmpty(rows)).toBe(false);
    expect(_.size(rows)).toBe(1);

    let row = rows[0];
    expect(_.isNullOrUndefined(row)).toBe(false);
    expect(row.node_id).toBe('12341234');
    expect(row.resource_id).toBe('abcd1234');

    logger.logDebug('initial recipe created = ' + JSON.stringify(row));

    let idCount = 10;
    await FormulaNodeRepository.upsertFormula(pool, () => idCount++, {
        id: '0',
        name: 'recipe',
        formula: {
            node_id: '0',
            node_type: 'and',
            parent_id: null,
            children: [{
                    node_id: '0',
                    node_type: 'resource',
                    resource_id: 'abcd1234'
                },
                {
                    node_id: '1',
                    node_type: 'resource',
                    resource_id: 'abcd5678'
                }
            ]
        }
    }, { sub: 'goofy' });

    client = await pool.connect();
    result = await client.query('select * from formula_node where parent_id is null');
    client.release();
    expect(_.isNullOrUndefined(result)).toBe(false);
    rows = result.rows;
    expect(_.isEmpty(rows)).toBe(false);
    expect(_.size(rows)).toBe(1);

    row = rows[0];
    expect(_.isNullOrUndefined(row)).toBe(false);
    expect(_.isNullOrUndefined(row.parent_id)).toBe(true);
    expect(row.owner_id).toBe('goofy');
    expect(_.isNullOrUndefined(row.resource_id)).toBe(true);
    expect(row.node_type).toBe('and');
    expect(_.isNullOrUndefined(row.quantity)).toBe(true);

    let parent_id = row.node_id;

    client = await pool.connect();
    result = await client.query('select * from formula_node where parent_id is not null');
    client.release();
    expect(_.isNullOrUndefined(result)).toBe(false);
    rows = result.rows;
    expect(_.isEmpty(rows)).toBe(false);
    expect(_.size(rows)).toBe(2);

    row = rows[0];
    expect(_.isNullOrUndefined(row)).toBe(false);
    expect(row.parent_id).toBe(parent_id);
    expect(row.owner_id).toBe('goofy');
    expect(row.resource_id).toBe('abcd1234');
    expect(row.node_type).toBe('resource');
    expect(_.isNullOrUndefined(row.quantity)).toBe(true);

    row = rows[1];
    expect(_.isNullOrUndefined(row)).toBe(false);
    expect(row.parent_id).toBe(parent_id);
    expect(row.owner_id).toBe('goofy');
    expect(row.resource_id).toBe('abcd5678');
    expect(row.node_type).toBe('resource');
    expect(_.isNullOrUndefined(row.quantity)).toBe(true);

});

test.only('Recipe update formula change type from AND with children to resource', async() => {
    const logLabel = 'Recipe update formula change type from AND with children to resource';
    insertGoofy();
    await insertRecipe('0', 'recipe', 'goofy');
    insertResource('abcd1234', 'resource', 'goofy');
    insertResource('abcd5678', 'resource2', 'goofy');

    let idCount = 10;
    await FormulaNodeRepository.upsertFormula(pool, () => idCount++, {
        id: '0',
        name: 'recipe',
        formula: {
            node_id: '0',
            node_type: 'and',
            parent_id: null,
            children: [{
                    node_id: '0',
                    node_type: 'resource',
                    resource_id: 'abcd1234'
                },
                {
                    node_id: '1',
                    node_type: 'resource',
                    resource_id: 'abcd5678'
                }
            ]
        }
    }, { sub: 'goofy' });

    logger.logDebug("After first insert, checking setup.");

    let client = await pool.connect();
    let result = await client.query('select * from formula_node where parent_id is null');
    client.release();

    expect(_.isNullOrUndefined(result)).toBe(false);
    expect(_.isNullOrUndefined(result.rows)).toBe(false);
    let rows = result.rows;
    expect(_.isEmpty(rows)).toBe(false);
    expect(_.size(rows)).toBe(1);

    let row = rows[0];
    expect(_.isNullOrUndefined(row)).toBe(false);
    expect(row.node_type).toBe('and');

    client = await pool.connect();
    result = await client.query('select * from formula_node where parent_id is not null');
    client.release();

    expect(_.isNullOrUndefined(result)).toBe(false);
    expect(_.isNullOrUndefined(result.rows)).toBe(false);
    rows = result.rows;
    expect(_.isEmpty(rows)).toBe(false);
    expect(_.size(rows)).toBe(2);

    logger.logDebug('initial recipe created = ' + JSON.stringify(row));

    await FormulaNodeRepository.upsertFormula(pool, () => '12341234', {
        id: '0',
        name: 'recipe',
        formula: {
            node_id: '0',
            node_type: 'resource',
            parent_id: null,
            resource_id: 'abcd1234'
        }
    }, { sub: 'goofy' });

    client = await pool.connect();
    result = await client.query('select * from formula_node where parent_id is null');
    client.release();
    expect(_.isNullOrUndefined(result)).toBe(false);
    rows = result.rows;
    expect(_.isEmpty(rows)).toBe(false);
    expect(_.size(rows)).toBe(1);

    row = rows[0];
    expect(_.isNullOrUndefined(row)).toBe(false);
    expect(_.isNullOrUndefined(row.parent_id)).toBe(true);
    expect(row.owner_id).toBe('goofy');
    expect(row.resource_id).toBe('abcd1234');
    expect(row.node_type).toBe('resource');
    expect(_.isNullOrUndefined(row.quantity)).toBe(true);

    client = await pool.connect();
    result = await client.query('select * from formula_node where parent_id is not null');
    client.release();
    expect(_.isNullOrUndefined(result)).toBe(false);
    rows = result.rows;
    expect(_.isEmpty(rows)).toBe(true);

});
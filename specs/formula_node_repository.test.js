import { newDb } from "pg-mem";
import _ from 'underscore';
import fs from 'fs';
import { upsertFormula } from '../server/repository/recipe/formula_node_repository.mjs';

beforeAll(async() => {
    console.log("setup");
    let files = await fs.promises.readdir('./migrations');
    console.log("files " + JSON.stringify(files));
    return {};
});

test('upsertFormula is defined', () => {
    expect(upsertFormula).toBeDefined();
});
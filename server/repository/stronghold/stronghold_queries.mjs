const SELECT_STRONGHOLD_BY_USER_ID = `
    SELECT s.*, u.name as owner_name
    FROM stronghold s LEFT join stronghold_user u on u.id = s.owner_id
    WHERE s.owner_id = $1
    ORDER BY s.id
`;

const UPDATE_STRONGHOLD = `
    UPDATE stronghold
    SET name = $2, scenario_id = $3
    WHERE id = $1 AND owner_id = $4
`;

const SELECT_STRONGHOLD_BY_ID_AND_USER_ID = `
    SELECT *
    FROM stronghold
    WHERE id = $1 AND owner_id = $2
    ORDER BY id
`;

const CREATE_STRONGHOLD = "INSERT INTO public.stronghold(id, name, owner_id) VALUES ($1, $2, $3);";

const DELETE_STRONGHOLD_BY_ID = `
    DELETE FROM stronghold
    WHERE id = $1
`;

export const StrongholdQueries = {
    SELECT_STRONGHOLD_BY_ID_AND_USER_ID,
    SELECT_STRONGHOLD_BY_USER_ID,
    UPDATE_STRONGHOLD,
    CREATE_STRONGHOLD,
    DELETE_STRONGHOLD_BY_ID
}
const SELECT_USER_BY_USER_ID = `SELECT * FROM stronghold_user WHERE id = $1`;
const CREATE_USER = `INSERT INTO public.stronghold_user (id, name, email, picture) VALUES ($1, $2, $3, $4);`

export const UserQueries = {
    SELECT_USER_BY_USER_ID,
    CREATE_USER
}
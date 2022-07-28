import { Logger } from '../commons/LogCommons.mjs';
import { USER_REPOSITORY_LOG_ENABLED } from '../commons/LogProperties.mjs';

const logger = new Logger('UserRepository', USER_REPOSITORY_LOG_ENABLED);

export const selectUserByUserId = async function(user_id) {
    return (await runQuery(SELECT_USER_BY_USER_ID, [user_id],
        (result) => {
            return result.rows[0];
        },
        (err) => {
            logger.logError("Error selecting user by user id: " + user_id);
            logger.logError(err);
            logger.logError(err.stack);
            throw err;
        }));
}

export const createUser = async function(id, name, email, picture) {
    (await runQuery(CREATE_USER, [id, name, email, picture],
        (result) => {
            return result.rows[0];
        },
        (err) => {
            logger.logError("Error while creating user: " + err);
            logger.logError(err);
            logger.logError(err.stack);
            throw err;
        }));
}

export const UserRepository = {
    selectUserByUserId,
    createUser
};
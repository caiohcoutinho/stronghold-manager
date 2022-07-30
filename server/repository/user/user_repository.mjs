import { HtmlUtilities } from '../commons/HtmlUtilities.mjs';
import Logger from '../commons/LogCommons.mjs';
import { USER_REPOSITORY_LOG_ENABLED } from '../commons/LogProperties.mjs';
import { UserQueries } from './user_queries.mjs'

const logger = new Logger(USER_REPOSITORY_LOG_ENABLED, 'UserRepository');

export const selectUserByUserId = async function(user_id) {
    let result = await HtmlUtilities.runQuerySync(UserQueries.SELECT_USER_BY_USER_ID, [user_id]);
    return result.rows[0];
}

export const createUser = async function(id, name, email, picture) {
    let result = await HtmlUtilities.runQuerySync(UserQueries.CREATE_USER, [id, name, email, picture]);
    return result.rows[0];
}

export const UserRepository = {
    selectUserByUserId,
    createUser
};
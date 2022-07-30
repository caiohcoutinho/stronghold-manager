import Logger from './LogCommons.mjs';
import { HTML_UTILITIES_LOG_ENABLED } from './LogProperties.mjs';
import { Database } from './Database.mjs';

const logger = new Logger(HTML_UTILITIES_LOG_ENABLED, 'HtmlUtilities');

const setHeadersNeverCache = function(res) {
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
}

const defaultResponseErrorHandler = function(response, message) {
    return (err) => {
        logger.logError(message + ': ' + err);
        logger.logError(err.stack);
        response.status(500);
        response.send(message + ': ' + err.stack);
    }
}

const defaultResponseQueryErrorHandler = function(response) {
    return defaultResponseErrorHandler(response, 'Error executing query');
}

const sendQuery = function(response, query, values) {
    return runQuery(query, values, (result) => {
        response.send(result.rows);
    }, defaultResponseQueryErrorHandler(response));
}

const runQuery = function(query, values, callback, errorCallback) {
    return Database.getPool()
        .query(query, values)
        .then(res => {
            callback(res);
        })
        .catch(err => {
            errorCallback ? errorCallback(err) : defaultResponseQueryErrorHandler(res)(err);
        })
}

const runQuerySync = async function(query, values) {
    return await Database.getPool()
        .query(query, values)
        .then(res => {
            return res;
        })
        .catch(err => {
            throw err;
        })
}

export const HtmlUtilities = {
    setHeadersNeverCache,
    sendQuery,
    runQuery,
    runQuerySync
}
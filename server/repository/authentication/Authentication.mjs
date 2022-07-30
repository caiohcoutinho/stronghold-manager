import jwt from 'jsonwebtoken';
import { HtmlUtilities } from '../commons/HtmlUtilities.mjs';
import _ from '../commons/UnderscoreMixin.mjs'
import { UserRepository } from '../user/user_repository.mjs'
import Logger from '../commons/LogCommons.mjs';
import { AUTHENTICATION_LOG_ENABLED } from "../commons/LogProperties.mjs";

const logger = new Logger(AUTHENTICATION_LOG_ENABLED, "Authentication");

const verifyIdTokenWithKey = function(idToken, pub) {
    return jwt.verify(idToken, pub, {
        audience: "240439775239-khrfib64ndsij9nndeoprqrg1gkogn4r.apps.googleusercontent.com",
        issuer: ["accounts.google.com", "https://accounts.google.com"],
        algorithms: 'RS256'
    });
}

var googlePublicKeysRetrieveDate = null;
var googlePublicKeysMaxAge = null;
var googlePublicKeys = [];

const areKeysExpired = function() {
    if (googlePublicKeysRetrieveDate == null) {
        return true;
    }
    let diff = now.getTime() - googlePublicKeysRetrieveDate;
    let diffInSeconds = diff / 1000;
    return diff >= googlePublicKeysMaxAge;
}

const refreshGoogleKeys = async function() {
    return axios
        .get('https://www.googleapis.com/oauth2/v1/certs')
        .then(function(response) {
            googlePublicKeysRetrieveDate = new Date();
            googlePublicKeysMaxAge = parseInt(response.headers['cache-control'].match(/max-age=(\d+)/)[1], 10);
            googlePublicKeys = response.data;
        })
        .catch(function(error) {
            googlePublicKeysRetrieveDate = null;
            googlePublicKeysMaxAge = null;
            googlePublicKeys = [];
            logger.logError('Error while trying to refresh google public keys: ' + error);
            logger.logError(error.stack);
        });
}

const validateIdToken = async function(idToken) {
    if (process.env.LOCAL) {
        return {
            sub: "1234abcd-1234-abcd-1234-abcd1234abcd",
            email: 'test_user@gmail.com',
            name: 'Goofy Goofest',
            picture: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDEzLQIYir3TKubuEpEgSS3mMWvKbUtPbPzzcKV0V3ai2Jq4FLsL6Kno0aD3H1R34xzsM&usqp=CAU'
        }
    }
    if (areKeysExpired) {
        await refreshGoogleKeys();
    }
    let i = 0;
    return _.find(_.map(_.values(googlePublicKeys), (key) => {
        try {
            return verifyIdTokenWithKey(idToken, key);
            return true;
        } catch (error) {
            return null;
        }
    }), _.negate(_.isNull));
}

const validateAuthenticatedNeverCache = function(callback) {
    return validateAuthenticated(callback, true);
}

const validateAuthenticated = function(callback, shouldNeverCache) {
    return function(req, res) {
        try {
            if (shouldNeverCache) {
                HtmlUtilities.setHeadersNeverCache(req);
            }
            let idToken = req.session.parsedToken;
            if (!process.env.LOCAL && _.isNullOrUndefined(idToken)) {
                res.status(401);
                res.send("Unauthorized");
            } else {
                res.setHeader('Content-Type', 'application/json');
                callback(req, res, idToken);
            }
        } catch (err) {
            logger.logError(err);
            logger.logError(err.stack);
            res.status(500)
            res.send("Internal server error");
        }
    }
}

const postAuthenticate = async function(req, res) {
    res.setHeader('Content-Type', 'application/json');

    let body = req.body;
    let idToken = body.idToken;
    let parsedToken = await validateIdToken(idToken);
    if (_.isNullOrUndefined(parsedToken)) {
        res.status(401)
        res.send("Unauthorized");
        return;
    }
    let user = await UserRepository.selectUserByUserId(parsedToken.sub);
    if (_.isNullOrUndefined(user)) {
        logger.logDebug("User don't exist. Creating.");
        await UserRepository.createUser(parsedToken.sub, parsedToken.name, parsedToken.email, parsedToken.picture);
    }
    req.session.parsedToken = parsedToken;
    res.send("OK");
}

export const postLogout = async function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            res.status(500)
            res.send("Error while logging out: " + err);
        } else {
            res.send("OK");
        }
    })
};

export const Authentication = {
    verifyIdTokenWithKey,
    areKeysExpired,
    refreshGoogleKeys,
    validateIdToken,
    validateAuthenticated,
    validateAuthenticatedNeverCache,
    postAuthenticate,
    postLogout
}
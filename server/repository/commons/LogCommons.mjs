import _ from './UnderscoreMixin.mjs';

const log = function(compiledLabel, logLevel, object) {
    let header = compiledLabel + "[" + logLevel + "]";
    console.log(header + ": " + (_.isString(object) ? object : JSON.stringify(object)));
}

export default class Logger {
    constructor(enabled, ...labels) {
        this.compiledLabel = _.reduce(labels, (memo, label) => {
            return memo + "[" + label + "]";
        }, "");
        this.enabled = _.isNullOrUndefined(enabled) || enabled == true;
    }

    logDebug(object) {
        if (!this.enabled) return;
        log(this.compiledLabel, "DEBUG", object);
    }

    logError(object) {
        log(this.compiledLabel, "ERROR", object);
    }

    logInfo(object) {
        if (!this.enabled) return;
        log(this.compiledLabel, "INFO", object);
    }
}
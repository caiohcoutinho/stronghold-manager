import _ from 'underscore';

const log = function(classLabel, logLevel, object) {
    let header = classLabel + "[" + +logLevel + "]";
    console.log(header + ": " + (_.isString(object) ? object : JSON.stringify(object)));
}

export default class Logger {
    constructor(enabled, ...labels) {
        this.compiledLabel = _.reduce(labels, (memo, label) => {
            return memo + "[" + label + "]";
        }, "");
        this.enabled = _.isUndefined(enabled) || enabled == true;
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
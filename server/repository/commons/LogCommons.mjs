import _ from 'underscore';

const log = function(classLabel, logLevel, logLabel, object) {
    let header = "[" + classLabel + "][" + logLevel + "][" + logLabel + "]";
    console.log(header + ": " + (_.isString(object) ? object : JSON.stringify(object)));
}

export default class Logger {
    constructor(classLabel, enabled) {
        this.classLabel = classLabel;
        this.enabled = _.isUndefined(enabled) || enabled == true;
    }

    logDebug(logLabel, object) {
        if (!this.enabled) return;
        log(this.classLabel, "DEBUG", logLabel, object);
    }

    logError(logLabel, object) {
        log(this.classLabel, "ERROR", logLabel, object);
    }

    logInfo(logLabel, object) {
        if (!this.enabled) return;
        log(this.classLabel, "INFO", logLabel, object);
    }
}
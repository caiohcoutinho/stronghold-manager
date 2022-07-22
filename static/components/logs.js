export const LOG_TYPE_ERROR = 'ERROR';
export const LOG_TYPE_WARNING = 'WARNING';
export const LOG_TYPE_INFO = 'INFO';
export const LOG_TYPES = [LOG_TYPE_ERROR, LOG_TYPE_WARNING, LOG_TYPE_INFO];

export class Log {
  constructor(type, text) {
    this.creationDate = new Date();
    this.type = type;
    this.text = text;
  }
}
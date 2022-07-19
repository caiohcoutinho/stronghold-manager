export const LOG_TYPE_ERROR = 'ERROR';
export const LOG_TYPES = [LOG_TYPE_ERROR];

export class Log {
  constructor(type, text) {
    this.creationDate = new Date();
    this.type = type;
    this.text = text;
  }
}
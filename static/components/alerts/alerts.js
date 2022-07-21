export const ALERT_TYPE_ERROR = 'ERROR';
export const ALERT_TYPE_INFO = 'INFO';
export const ALERT_TYPES = [ALERT_TYPE_ERROR, ALERT_TYPE_INFO];
import { ALERT_MAX_SIZE } from '../constants.js';

export class Alert {
  constructor(type, text) {
    this.creationDate = new Date();
    this.type = type;
    this.text = text != null ? text.substring(0, ALERT_MAX_SIZE) : null;
  }
}
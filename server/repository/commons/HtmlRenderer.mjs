import fs from 'fs';
import _ from './UnderscoreMixin.mjs';

export const htmlRenderer = function(path, view_options, callback) {
    let props = view_options.properties;
    let str = fs.readFileSync(path).toString();
    _.each(_.pairs(props), (pair) => {
        str = str.replace(new RegExp('#{' + pair[0] + '}', 'g'), pair[1]);
    });
    callback(null, str);
}
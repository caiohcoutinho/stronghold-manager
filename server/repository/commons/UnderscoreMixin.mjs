import _ from 'underscore';

_.mixin({
    isNullOrUndefined: function(obj) {
        return _.isNull(obj) || _.isUndefined(obj);
    }
})

export default _;
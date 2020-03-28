"use strict";
exports.__esModule = true;
var fs = require('fs');
var Template = /** @class */ (function () {
    function Template(filename) {
        this.template = fs.readFileSync(filename, 'utf8');
    }
    Template.prototype.render = function (values) {
        if (values === void 0) { values = {}; }
        var handler = new Function('values', [
            'const tagged = ( ' + Object.keys(values).join(', ') + ' ) =>',
            '`' + this.template + '`',
            'return tagged(...values)'
        ].join('\n'));
        var handlerValues = Object.values(values);
        return handler(handlerValues);
    };
    return Template;
}());
exports.Template = Template;

// require css
require("../../../css/base.css");

//require js
require('../../../ts/module.highlight.ts');
require('../../../ts/module.input.ts');
require('../../../ts/module.http.ts');

module.exports = util = {
    ensureAngular: function () {
        require.ensure([], function () {
            require('../../../ts/module.ensure.ts');
        });
    }
}

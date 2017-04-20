util = jQuery.prototype = {
    changeStyle: function () {
        $('body').css('background-color', 'red');
    },
    alertMsg: function () {
        alert(300);
    },
    ensure: function () {
        require.ensure([], function (require) {
            var foo = require('ensure');
            foo.ensureMsg();
        });
    }
};

var require;
require.config({
    baseUrl: 'js/vendor',
    paths: {
        app: '../app'
    }
});
require(['app/util'], function (util) {
    util.changeStyle();
    util.alertMsg();
    util.ensure();
});

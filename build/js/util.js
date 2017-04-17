define(function () {
   return {
       changeStyle: function () {
           $('body').css('background-color', 'red');
       },
       alertMsg: function () {
           alert(300);
       },
       ensure: function () {
           require.ensure(['ensure.js'], function () {
               console.log(ensureMsg());
           });
       }
   };
});

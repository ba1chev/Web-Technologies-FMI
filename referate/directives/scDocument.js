(function () {
  'use strict';

  angular.module('referatApp').directive('scDocument', function () {
    return {
      restrict: 'A',
      link: function (scope, element) {
        element.attr('role', 'document');
        element.addClass('referat-main');
      },
    };
  });
})();

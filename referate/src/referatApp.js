(function () {
  'use strict';

  angular.module('referatApp').controller('ReferatCtrl', [
    '$scope',
    '$timeout',
    '$window',
    function ($scope, $timeout, $window) {
      $scope.footerYear = new Date().getFullYear();

      $scope.env = {
        secure: !!$window.isSecureContext,
        subtle: !!($window.crypto && $window.crypto.subtle),
        protocol: $window.location.protocol,
      };

      $scope.digestInput = 'Web Cryptography API';
      $scope.digestHex = '';
      $scope.digestBusy = false;
      $scope.digestError = '';

      $scope.refreshEnv = function () {
        $scope.env.secure = !!$window.isSecureContext;
        $scope.env.subtle = !!($window.crypto && $window.crypto.subtle);
        $scope.env.protocol = $window.location.protocol;
      };

      $scope.computeSha256 = function () {
        if (!$window.crypto || !$window.crypto.subtle) {
          return;
        }
        $scope.digestBusy = true;
        $scope.digestError = '';
        $scope.digestHex = '';
        var enc = new TextEncoder();
        var data = enc.encode($scope.digestInput || '');
        $window.crypto.subtle
          .digest('SHA-256', data)
          .then(function (buf) {
            var bytes = new Uint8Array(buf);
            var hex = Array.from(bytes, function (b) {
              return b.toString(16).padStart(2, '0');
            }).join('');
            $scope.$apply(function () {
              $scope.digestHex = hex;
              $scope.digestBusy = false;
            });
          })
          .catch(function (err) {
            $scope.$apply(function () {
              $scope.digestError = err && err.message ? err.message : String(err);
              $scope.digestBusy = false;
            });
          });
      };

      $scope.runPrettify = function () {
        $timeout(function () {
          var pr = $window.PR;
          if (pr && typeof pr.prettyPrint === 'function') {
            pr.prettyPrint();
          }
        }, 0);
      };

      $scope.runPrettify();
    },
  ]);
})();

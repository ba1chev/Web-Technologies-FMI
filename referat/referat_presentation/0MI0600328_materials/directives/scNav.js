(function () {
  'use strict';

  angular.module('referatApp').directive('scNav', function () {
    return {
      restrict: 'E',
      replace: true,
      scope: {},
      template:
        '<nav class="navbar navbar-fixed-top referat-navbar-custom" aria-label="Основна навигация">' +
        '<div class="container-fluid referat-layout-width referat-navbar-inner">' +
        '<a class="referat-navbar-brand" href="#tekst-start">Реферат · Web Cryptography API</a>' +
        '<ul class="nav navbar-nav referat-navbar-links">' +
        '<li ng-repeat="l in links"><a ng-href="{{l.href}}">{{l.label}}</a></li>' +
        '</ul>' +
        '</div>' +
        '</nav>',
      controller: [
        '$scope',
        function ($scope) {
          $scope.links = [
            { href: '#vavedenie', label: 'Въведение' },
            { href: '#scenarii', label: 'Сценарии' },
            { href: '#api-osnovi', label: 'Основи на API' },
            { href: '#bezopasen-kontekst', label: 'Безопасен контекст' },
            { href: '#subtlecrypto', label: 'SubtleCrypto' },
            { href: '#algoritmi', label: 'Алгоритми' },
            { href: '#poddrzshka', label: 'Поддръжка' },
            { href: '#demo-interactive', label: 'Демо' },
            { href: '#primer-kod', label: 'Примерен код' },
            { href: '#literatura', label: 'Литература' },
          ];
        },
      ],
    };
  });
})();

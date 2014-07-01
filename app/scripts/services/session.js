'use strict';

angular.module('ehrApp')
  .factory('Session', function ($resource) {
    return $resource('/api/session/');
  });

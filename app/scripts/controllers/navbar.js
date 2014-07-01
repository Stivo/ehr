'use strict';

angular.module('ehrApp')
  .controller('NavbarCtrl', function ($scope, $location, Auth) {
        $scope.menu = [
            {
                'title': 'Home',
                'link': '/'
            },
            {
                'title': 'Settings',
                'link': '/settings'
            },
            {
                title: 'Employees',
                link: '/employee'
            },
            {
                title: 'Patients',
                link: '/patients'
            }
        ];
    
    $scope.logout = function() {
      Auth.logout()
      .then(function() {
        $location.path('/login');
      });
    };
    
    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });

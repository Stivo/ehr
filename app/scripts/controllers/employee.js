'use strict';

angular.module('ehrApp')
  .controller('EmployeeCtrl', function ($scope, $http, EmployeeService) {
  	
    $scope.employees = EmployeeService.getEmployees();

    $scope.formConsultation = {};


    $scope.submitForm = function() {
        $http.post('http://localhost:9000/consultation?mode=create', $scope.formConsultation);
    };

  });


'use strict';

angular.module('ehrApp')
  .controller('PatientCtrl', function ($scope, $log, PatientService) {
    $scope.patients = PatientService.getPatients();
    $scope.formPatient = {};
    $scope.filteredUsers = [];
    var that = $scope;

    $scope.search = function() {
        $scope.filteredUsers = PatientService.search($scope.formPatient);
    };

 });


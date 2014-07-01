'use strict';

angular.module('ehrApp')
    .controller('PatientDetailsCtrl', function ($scope, $routeParams, PatientService) {
        var patientId = parseInt($routeParams.id);
        $scope.patient = PatientService.getPatientById(patientId);
    });


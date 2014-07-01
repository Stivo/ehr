'use strict';

angular.module('ehrApp')
  .controller('ConsultationCtrl', function ($scope, ConsultationService) {
  	
    //$scope.consultations = ConsultationService.getConsultations();


        $scope.formConsultation = {};


        $scope.submitForm = function() {
            $http({
                method : 'POST',
                url : 'http://localhost:8888/consultation?mode=create',
                body: $scope.formConsultation,
                headers : {
                    'Content-Type' : 'application/json'
                }
            })
    };

  });


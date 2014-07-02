'use strict';

angular.module('ehrApp')
    .controller('EmployeeCtrl', function ($scope, $http, EmployeeService) {

        function debounce(func, wait, immediate) {
            var timeout;
            var context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            }, wait);
            if (immediate && !timeout) func.apply(context, args);
        };


        $scope.employees = EmployeeService.getEmployees();

        $scope.formConsultation = {};

        $scope.lastResponse = {};

        function update() {
            $http.post('http://localhost:9000/consultation?mode=validate', $scope.formConsultation).then(function (callback) {
                if (angular.equals($scope.formConsultation, callback.data.input)) {
                    $scope.lastResponse = callback.data;
                }
            });
        };

        $scope.$watch('formConsultation', function(newValue, oldValue) {
            debounce(update, 1000);
        }, true);
        $scope.submitForm = function () {
            $http.post('http://localhost:9000/consultation?mode=create', $scope.formConsultation).then(function (callback) {
                    if (callback.data.error) {
                        if (angular.equals($scope.formConsultation, callback.data.input)) {
                            $scope.lastResponse = callback.data;
                        }
                    }
                    else {
                        $scope.lastResponse = callback.data;
                    }
                }
            )
            ;
        };

    })
;


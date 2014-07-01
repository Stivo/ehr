'use strict';

var app = angular.module('ehrApp');

app.factory('EmployeeService', function ($http) {
    var employeeService = {};

    employeeService.getEmployees = function() {
        return [{
            firstname: 'Hans',
            lastName: 'Muster'
        }, {
            firstname: 'Erika',
            lastName: 'Musterfrau'
        }];
    };

    return employeeService;
});
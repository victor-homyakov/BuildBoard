/// <reference path='../_all.ts' />
module buildBoard {
    'use strict';

    export class BranchLineController {
        public static NAME = 'branchLineController';


        public static $inject = [
            '$scope'
        ];

        constructor($scope:IBranchScope) {

            //$scope.getBranch = ()=>$scope.branch;
        }
    }
}
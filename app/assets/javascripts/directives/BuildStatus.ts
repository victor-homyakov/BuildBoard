/// <reference path="../_all.ts" />
module buildBoard {
    export class BuildStatusDirective implements ng.IDirective {
        static NAME = "buildStatus";
        scope = {
            build: "=",
            branch: "=",
            type: "@"
        };
        controller = LastBuildStatusController;
        templateUrl = 'assets/partials/buildStatus.html';
        restrict = "E";
        replace = true;
    }


    export interface IBuildStatusScope extends ng.IScope {
        build:Build;
        branch:Branch;
        type: string;
        showList: boolean;
        forceBuild(buildAction:BuildAction);
        toggleParameters(buildAction:BuildAction);
        clearTimeoutOnFocus();
        hideOnBlur();
        buildActions:BuildAction[]
        getBuildStatus(build:Build):Status;
        toggleBuild(build:Build);
        toggle();
        pending:boolean;
    }

    export class LastBuildStatusController {
        public static $inject = ['$scope', BackendService.NAME, '$timeout', '$q'];

        constructor(private $scope:IBuildStatusScope, backendService:BackendService, $timeout:ng.ITimeoutService, $q:ng.IQService) {

            this.$scope.toggle = () => {
                if (!this.$scope.showList) {
                    this.$scope.showList = true;
                    this.$scope.pending = true;


                    backendService.getBuildActions(this.$scope.branch.name).then(data=> {
                        this.$scope.buildActions = data.data;
                        this.$scope.pending = false;
                    });


                }
                else {
                    this.$scope.showList = false;
                    this.$scope.buildActions = [];
                }


            };


            this.$scope.forceBuild = (buildAction:BuildAction) => {
                backendService.forceBuild(buildAction).success(build=> {
                    this.$scope.showList = false;
                    this.$scope.build = build;
                });
            };
            var timeoutId = $q.defer().promise;
            this.$scope.clearTimeoutOnFocus = () => {
                $timeout.cancel(timeoutId);
            };
            this.$scope.hideOnBlur = () => {
                timeoutId = $timeout(() => {
                    this.$scope.showList = false;
                    this.$scope.buildActions = [];
                    this.$scope.$digest()
                }, 0);
            };

            this.$scope.toggleParameters = (buildAction:BuildAction) => {
                var currentState = buildAction.showParameters;
                this.$scope.buildActions.forEach(function (buildAction:BuildAction) {
                    buildAction.showParameters = false;
                });
                buildAction.showParameters = !currentState;
            };
            this.$scope.getBuildStatus = StatusHelper.parse;
            this.$scope.toggleBuild = (build:Build)=> {
                var branch = this.$scope.branch;
                var toggled = !build.toggled;
                backendService.toggleBuild(branch.name, build.number, toggled).success(b=> {
                    build.toggled = toggled;
                    if (build.number == branch.lastBuild.number) {
                        branch.lastBuild.toggled = build.toggled;
                        branch.lastBuild.parsedStatus = StatusHelper.parseInfo(branch.lastBuild.status, build.toggled);
                    }
                });
            }
        }
    }
}
(function () {
    'use strict';
    angular.module('app')
        .controller('projectController', ['projectService', '$q', '$mdDialog', '$scope', ProjectController]);
        
    function ProjectController(projectService, $q, $mdDialog, $scope) {
        var remote = require('remote');
        var dialog = remote.require('dialog');
        var self = this;

        self.selected = null;
        self.projects = [];
        self.selectedIndex = 0;
        self.filterText = null;
        self.selectProject = selectProject;
        self.deleteProject = deleteProject;
        self.saveProject = saveProject;
        self.createProject = createProject;
        self.filter = filterProject;
        self.choosePath = choosePath;
        
        // Load initial data
        getAllProjects();
        
        //----------------------
        // Internal functions 
        //----------------------
        function choosePath() {
            var options = {
                title: 'Choose Project Path',
                properties: ['openDirectory']
            };
            dialog.showOpenDialog(options, function (folder) {
                self.selected.choosenPath = folder;
                console.log('path = ' + folder);
            });
        }

        function selectProject(project, index) {
            self.selected = angular.isNumber(project) ? self.projects[project] : project;
            self.selectedIndex = angular.isNumber(project) ? project : index;
        }

        function deleteProject($event) {
            var confirm = $mdDialog.confirm()
                .title('Are you sure?')
                .content('Are you sure want to delete this project?')
                .ok('Yes')
                .cancel('No')
                .targetEvent($event);


            $mdDialog.show(confirm).then(function () {
                projectService.destroy(self.selected.project_id).then(function (affectedRows) {
                    self.projects.splice(self.selectedIndex, 1);
                });
            }, function () { });
        }

        function saveProject($event) {
            if (self.selected != null && self.selected.project_id != null) {
                projectService.update(self.selected).then(function (affectedRows) {
                    $mdDialog.show(
                        $mdDialog
                            .alert()
                            .clickOutsideToClose(true)
                            .title('Success')
                            .content('Data Updated Successfully!')
                            .ok('Ok')
                            .targetEvent($event)
                        );
                });
            }
            else {
                //self.selected.project_id = new Date().getSeconds();
                projectService.create(self.selected).then(function (affectedRows) {
                    $mdDialog.show(
                        $mdDialog
                            .alert()
                            .clickOutsideToClose(true)
                            .title('Success')
                            .content('Data Added Successfully!')
                            .ok('Ok')
                            .targetEvent($event)
                        );
                });
            }
        }

        function createProject() {
            self.selected = {};
            self.selectedIndex = null;
        }

        function getAllProjects() {
            projectService.getProjects().then(function (projects) {
                self.projects = [].concat(projects);
                self.selected = projects[0];
            });
        }

        function filterProject() {
            if (self.filterText == null || self.filterText == "") {
                getAllProjects();
            }
            else {
                projectService.getByName(self.filterText).then(function (projects) {
                    self.projects = [].concat(projects);
                    self.selected = projects[0];
                });
            }
        }
    }

})();
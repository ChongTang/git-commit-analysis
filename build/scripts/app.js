(function () {
    'use strict';

    var _templateBase = './scripts';

    angular.module('app', [
        'ngRoute',
        'ngMaterial',
        'ngAnimate'
    ])
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/', {
                templateUrl: _templateBase + '/project/project.html',
                controller: 'projectController',
                controllerAs: '_ctrl'
            });
            $routeProvider.otherwise({ redirectTo: '/' });
        }
        ]);

})();
(function () {
    'use strict';
    var mysql = require('mysql');
    
    // Creates MySql database connection
    var connection = mysql.createConnection({
        host: "localhost",
        user: "gitcommit",
        password: "commit",
        database: "GitCommit"
    });

    angular.module('app')
        .service('projectService', ['$q', ProjectService]);

    function ProjectService($q) {
        return {
            getProjects: getProjects,
            getById: getProjectById,
            getByName: getProjectByName,
            create: createProject,
            destroy: deleteProject,
            update: updateProject
        };

        function getProjects() {
            var deferred = $q.defer();
            var query = "SELECT * FROM projects";
            connection.query(query, function (err, rows) {
                if (err) deferred.reject(err);
                deferred.resolve(rows);
            });
            return deferred.promise;
        }

        function getProjectById(id) {
            var deferred = $q.defer();
            var query = "SELECT * FROM projects WHERE project_id = ?";
            connection.query(query, [id], function (err, rows) {
                if (err) deferred.reject(err);
                deferred.resolve(rows);
            });
            return deferred.promise;
        }

        function getProjectByName(name) {
            var deferred = $q.defer();
            var query = "SELECT * FROM projects WHERE name LIKE  '" + name + "%'";
            connection.query(query, [name], function (err, rows) {
                if (err) deferred.reject(err);

                deferred.resolve(rows);
            });
            return deferred.promise;
        }

        function createProject(project) {
            var deferred = $q.defer();
            var query = "INSERT INTO projects SET ?";
            connection.query(query, project, function (err, res) {
                if (err) deferred.reject(err);
                deferred.resolve(res.insertId);
            });
            return deferred.promise;
        }

        function deleteProject(id) {
            var deferred = $q.defer();
            var query = "DELETE FROM projects WHERE project_id = ?";
            connection.query(query, [id], function (err, res) {
                if (err) deferred.reject(err);
                deferred.resolve(res.affectedRows);
            });
            return deferred.promise;
        }

        function updateProject(project) {
            var deferred = $q.defer();
            var query = "UPDATE projects SET name = ? WHERE project_id = ?";
            connection.query(query, [project.name, project.project_id], function (err, res) {
                if (err) deferred.reject(err);
                deferred.resolve(res);
            });
            return deferred.promise;
        }
    }
})();
(function () {
    'use strict';
    angular.module('app')
        .controller('projectController', ['projectService', '$q', '$mdDialog', '$scope', ProjectController]);
        
    function ProjectController(projectService, $q, $mdDialog, $scope) {
        var remote = require('remote');
        var dialog = remote.require('dialog');
        var git = require('git-utils');
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
        self.selectPath = selectPath;
        
        // Load initial data
        getAllProjects();
        
        //----------------------
        // Internal functions 
        //----------------------
        function selectPath() {
            var options = {
                title: 'Choose Project Path',
                properties: ['openDirectory']
            };
            dialog.showOpenDialog(options, function (folder) {
                self.selected.choosenPath = folder;
                console.log('path = ' + folder);
                // scan the selected path
                var repository = git.open(folder);
                if(repository === null) {
                    // This is not a valid repository, display an error message here
                    window.alert('The selected path is not a legal Git repo!');
                    return;
                }
                // if right, go ahead to analyze the selected repo
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
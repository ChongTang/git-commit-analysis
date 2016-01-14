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
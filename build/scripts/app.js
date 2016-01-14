(function () {
    'use strict';

    var _templateBase = './scripts';

    angular.module('app', [
        'ngRoute',
        'ngMaterial',
        'ngAnimate'
    ])
        .config(['$routeProvider', function ($routeProvider) {
            // $routeProvider.when('/', {
            //     templateUrl: _templateBase + '/customer/customer.html',
            //     controller: 'customerController',
            //     controllerAs: '_ctrl'
            // });
            // $routeProvider.otherwise({ redirectTo: '/' });
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
        .service('customerService', ['$q', CustomerService]);

    function CustomerService($q) {
        return {
            getCustomers: getCustomers,
            getById: getCustomerById,
            getByName: getCustomerByName,
            create: createCustomer,
            destroy: deleteCustomer,
            update: updateCustomer
        };

        function getCustomers() {
            var deferred = $q.defer();
            var query = "SELECT * FROM customers";
            connection.query(query, function (err, rows) {
                if (err) deferred.reject(err);
                deferred.resolve(rows);
            });
            return deferred.promise;
        }

        function getCustomerById(id) {
            var deferred = $q.defer();
            var query = "SELECT * FROM customers WHERE customer_id = ?";
            connection.query(query, [id], function (err, rows) {
                if (err) deferred.reject(err);
                deferred.resolve(rows);
            });
            return deferred.promise;
        }

        function getCustomerByName(name) {
            var deferred = $q.defer();
            var query = "SELECT * FROM customers WHERE name LIKE  '" + name + "%'";
            connection.query(query, [name], function (err, rows) {
                if (err) deferred.reject(err);

                deferred.resolve(rows);
            });
            return deferred.promise;
        }

        function createCustomer(customer) {
            var deferred = $q.defer();
            var query = "INSERT INTO customers SET ?";
            connection.query(query, customer, function (err, res) {
                if (err) deferred.reject(err);
                deferred.resolve(res.insertId);
            });
            return deferred.promise;
        }

        function deleteCustomer(id) {
            var deferred = $q.defer();
            var query = "DELETE FROM customers WHERE customer_id = ?";
            connection.query(query, [id], function (err, res) {
                if (err) deferred.reject(err);
                deferred.resolve(res.affectedRows);
            });
            return deferred.promise;
        }

        function updateCustomer(customer) {
            var deferred = $q.defer();
            var query = "UPDATE customers SET name = ?, email = ? WHERE customer_id = ?";
            connection.query(query, [customer.name, customer.email, customer.customer_id], function (err, res) {
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
        .controller('customerController', ['customerService', '$q', '$mdDialog', CustomerController]);

    function CustomerController(customerService, $q, $mdDialog) {
        var self = this;

        self.selected = null;
        self.customers = [];
        self.selectedIndex = 0;
        self.filterText = null;
        self.selectCustomer = selectCustomer;
        self.deleteCustomer = deleteCustomer;
        self.saveCustomer = saveCustomer;
        self.createCustomer = createCustomer;
        self.filter = filterCustomer;
        
        // Load initial data
        getAllCustomers();
        
        //----------------------
        // Internal functions 
        //----------------------
        
        function selectCustomer(customer, index) {
            self.selected = angular.isNumber(customer) ? self.customers[customer] : customer;
            self.selectedIndex = angular.isNumber(customer) ? customer : index;
        }

        function deleteCustomer($event) {
            var confirm = $mdDialog.confirm()
                .title('Are you sure?')
                .content('Are you sure want to delete this customer?')
                .ok('Yes')
                .cancel('No')
                .targetEvent($event);


            $mdDialog.show(confirm).then(function () {
                customerService.destroy(self.selected.customer_id).then(function (affectedRows) {
                    self.customers.splice(self.selectedIndex, 1);
                });
            }, function () { });
        }

        function saveCustomer($event) {
            if (self.selected != null && self.selected.customer_id != null) {
                customerService.update(self.selected).then(function (affectedRows) {
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
                //self.selected.customer_id = new Date().getSeconds();
                customerService.create(self.selected).then(function (affectedRows) {
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

        function createCustomer() {
            self.selected = {};
            self.selectedIndex = null;
        }

        function getAllCustomers() {
            customerService.getCustomers().then(function (customers) {
                self.customers = [].concat(customers);
                self.selected = customers[0];
            });
        }

        function filterCustomer() {
            if (self.filterText == null || self.filterText == "") {
                getAllCustomers();
            }
            else {
                customerService.getByName(self.filterText).then(function (customers) {
                    self.customers = [].concat(customers);
                    self.selected = customers[0];
                });
            }
        }
    }

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
            var query = "UPDATE projects SET name = ?, email = ? WHERE project_id = ?";
            connection.query(query, [project.name, project.email, project.project_id], function (err, res) {
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
        .controller('projectController', ['projectService', '$q', '$mdDialog', ProjectController]);

    function ProjectController(projectService, $q, $mdDialog) {
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
        
        // Load initial data
        getAllProjects();
        
        //----------------------
        // Internal functions 
        //----------------------
        
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
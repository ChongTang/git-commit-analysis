var childProcess = require('child_process');
//var electron = require('electron-prebuilt');
var gulp = require('gulp');
var jetpack = require('fs-jetpack');
var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var os = require('os');
var release_windows = require('./build.windows');
var release_linux = require('./build.linux');
var release_osx = require('./build.osx');

var projectDir = jetpack;
var srcDir = projectDir.cwd('./app');
var destDir = projectDir.cwd('./build');
  
// get the dependencies
var gulp = require('gulp'),
    childProcess = require('child_process'),
    electron = require('electron-prebuilt');

// create the gulp task
gulp.task('run', function () {
    childProcess.spawn(electron, ['--debug=5858', './app'], { stdio: 'inherit' });
});

gulp.task('clean', function (callback) {
    return destDir.dirAsync('.', { empty: true });
});

gulp.task('copy', ['clean'], function () {
    return projectDir.copyAsync('app', destDir.path(), {
        overwrite: true, matching: [
            './node_modules/**/*',
            '*.html',
            '*.css',
            'main.js',
            'package.json'
        ]
    });
});

gulp.task('build', ['copy'], function () {
    return gulp.src('./app/index.html')
        .pipe(usemin({
            js: [uglify()]
        }))
        .pipe(gulp.dest('build/'));
});

gulp.task('build-electron', function () {
    switch (os.platform()) {
        case 'darwin':
            console.log('build osx')
            return release_osx.build(); 
            break;
        case 'linux':
            console.log('build linux')
            return release_linux.build();
            break;
        case 'win32':
            console.log('build windows');
            return release_windows.build();
    }
});
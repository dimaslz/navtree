(function(console) {
    'use strict';

    var gulp = require('gulp');
    var watch = require('gulp-watch');
    var io = require('socket.io');

    gulp.task('chrome-watch', function () {
        var WEB_SOCKET_PORT = 8890;

        io = io.listen(WEB_SOCKET_PORT);

        watch('../**/*.*', function(file) {
            console.log('change detected', file.relative);
            io.emit('file.change', {});
        });
    });

})(global.console);
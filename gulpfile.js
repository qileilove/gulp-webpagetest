'use strict';

var gulp        = require('gulp'),
    webpagetest = require('./tasks/webpagetest.js');

gulp.task('test', webpagetest(require('./test/config/options.json')));

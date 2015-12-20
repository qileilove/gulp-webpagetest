'use strict';

var gulp        = require('gulp'),
    webpagetest = require('./tasks/webpagetest.js');

gulp.task('test', function() {
  var options = require('./test/config/options.json');
  webpagetest(options);
});

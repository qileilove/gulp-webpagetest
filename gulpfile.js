var gulp        = require('gulp'),
    options     = require('./test/config/options.json'),
    webpagetest = require('./tasks/webpagetest.js');

options.callback = function() {
  console.log('WPT test done !');
};

gulp.task('test', webpagetest(options));

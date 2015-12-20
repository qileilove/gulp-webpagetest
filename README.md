# gulp-webpagetest [![NPM Version](https://img.shields.io/npm/v/gulp-webpagetest.svg)](https://npmjs.org/package/gulp-webpagetest)

Gulp task for web performance analysis via WebPageTest.

## Install

```
$ npm install --save-dev gulp-babel babel-preset-es2015
```

## Usage

```js
var gulp = require('gulp'),
    webpagetest = require('./tasks/webpagetest.js');

gulp.task('test', webpagetest({
  "url": "http://www.google.com",
  "key": "YOUR_WEBPAGETEST_API_KEY"
}));
```

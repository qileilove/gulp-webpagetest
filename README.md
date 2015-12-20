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
  "url": "http://www.lycee-lebuat.org/mot-directeur",
  "key": "A.f8e1e6a0e9a69a34faddc9d883fc01fc"
}));
```

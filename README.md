# gulp-webpagetest

[![Build Status](https://travis-ci.org/ivangabriele/gulp-webpagetest.svg?branch=master)](https://travis-ci.org/ivangabriele/gulp-webpagetest)
[![NPM Version](https://img.shields.io/npm/v/gulp-webpagetest.svg?style=flat)](https://www.npmjs.org/package/gulp-webpagetest)
[![NPM Downloads](https://img.shields.io/npm/dm/gulp-webpagetest.svg?style=flat)](https://www.npmjs.org/package/gulp-webpagetest)
[![Dependency Status](https://david-dm.org/ivangabriele/gulp-webpagetest.svg)](https://david-dm.org/ivangabriele/gulp-webpagetest)
[![devDependency Status](https://david-dm.org/ivangabriele/gulp-webpagetest/dev-status.svg)](https://david-dm.org/ivangabriele/gulp-webpagetest#info=devDependencies)

Gulp task for web performance analysis via WebPageTest.

## Install

```
$ npm install --save-dev gulp-webpagetest
```

## Usage

Here is an example of a small test with budget goals :

```js
var gulp = require('gulp'),
    webpagetest = require('gulp-webpagetest');

gulp.task('webpagetest', webpagetest({
  url: 'http://www.google.com',
  key: 'YOUR_WEBPAGETEST_API_KEY',
  location: 'Dulles:Chrome',
  firstViewOnly: true,
  output: 'output/results.json',
  budget: {
    SpeedIndex: 1000,
    visualComplete: 1000
  }
}));
```

### Options

#### options.connectivity

Type `String`
Default value: `"Cable"`

Connectivity type (DSL, Cable, FIOS, Dial, 3G, 3GFast, Native, custom).

#### options.firstViewOnly

Type `Boolean`
Default value: `false`

Set to `true` to skip the Repeat View test.

#### options.key

Type `String`
Default value: NONE

The API Key for the public instance of WebPageTest. *Not needed if using a private instance of webpagetest.*

#### options.latency

Type `String`
Default value: NONE

First-hop Round Trip Time in ms *(REQUIRES 'custom' connectivity)*.

#### options.location

Type `String`
Default value: `"Dulles:Chrome"`

WebPageTest Location to test from.

#### options.login

Type `String`
Default value: NONE

User name to use for authenticated tests (HTTP authentication).

#### options.output

Type `String`
Default value: NONE

The file to output the JSON results to.

#### options.packetLossRate

Type `Integer`
Default value: `0`

Packet loss rate - percent of packets to drop *(REQUIRES 'custom' connectivity)*.

#### options.password

Type `String`
Default value: NONE

Password to use for authenticated tests (HTTP authentication).

#### options.pollResults

Type `Integer`
Default value: `5`

Poll for results after test is scheduled at every *n* seconds.

#### options.runs

Type `Integer`
Default value: `1`

Number of test runs (1-10 on the public instance).

#### options.timeout

Type `Integer`
Default value: `60`

Timeout (in seconds) for the tests to run.

#### options.video

Type `Integer`
Default value: `1`

Set to 1 to capture video (video is required for calculating Speed Index).

#### options.url

Type `String`
Default value: NONE

URL to be tested **(MANDATORY option)**.

#### options.wptInstance

Type `String`
Default value: `"www.webpagetest.org"`

The WPT instance to conduct the tests with.

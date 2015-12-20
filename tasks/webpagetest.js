'use strict';

const PLUGIN_NAME = 'gulp-webpagetest';

var _           = require('lodash'),
    gulp        = require('gulp'),
    gutil       = require('gulp-util'),
    PluginError = gutil.PluginError,
    through     = require('through2'),
    WebPageTest = require('webpagetest');

function prefixStream(prefixText) {
  var stream = through();
  stream.write(prefixText);
  return stream;
}

var gulpWebPageTest = function(options) {
  
  if (!options) {
    throw new gutil.PluginError(PLUGIN_NAME, 'When calling webpagetest(options), options parameter is MANDATORY.');
  }

  if (!_.isPlainObject(options)) {
    throw new gutil.PluginError(PLUGIN_NAME, 'When calling webpagetest(options), options MUST be an object.');
  }

  if (!options.url) {
    throw new gutil.PluginError(PLUGIN_NAME, 'Missing options.url property in webpagetest(options) call.');
  }

  if (!options.budget) {
    options.budget = {};
  }

  /**
   * WebPageTest API and Budget (in <budget> property) settings.
   * @see https://sites.google.com/a/webpagetest.org/docs/advanced-features/webpagetest-restful-apis
   *
   * @todo Separate API settings from Budget ones.
   * 
   * @property {integer} authenticationType Type of authentication to use: 0 = Basic Auth, 1 = SNS. <authType> API parameter.
   * @property {integer} bandwidthDown      Download bandwidth in Kbps (used when specifying a custom connectivity profile). <bwDown> API parameter.
   * @property {integer} bandwidthUp        Upload bandwidth in Kbps (used when specifying a custom connectivity profile). <bwUp> API parameter.
   * @property {string}  connectivity       Connectivity type (DSL, Cable, FIOS, Dial, 3G, 3GFast, Native, custom).
   * @property {integer} firstViewOnly      Set to 1 to skip the Repeat View test. <fvonly> API parameter.
   * @property {integer} key                API Key. <k> API parameter.
   * @property {integer} latency            First-hop Round Trip Time in ms (used when specifying a custom connectivity profile).
   * @property {string}  location           Location to test from.
   * @property {string}  login              User name to use for authenticated tests (http authentication).
   * @property {integer} packetLossRate     Packet loss rate - percent of packets to drop (used when specifying a custom connectivity profile). <plr> API parameter.
   * @property {string}  password           Password to use for authenticated tests (http authentication).
   * @property {integer} runs               Number of test runs (1-10 on the public instance).
   * @property {string}  url                URL to be tested.
   * @property {integer} video              Set to 1 to capture video (video is required for calculating Speed Index).
   */
  var options = {
    authenticationType: options.authenticationType    || 0,
    bandwidthDown:      options.bandwidthDown         || '',
    bandwidthUp:        options.bandwidthUp           || '',
    connectivity:       options.connectivity          || 'Cable',
    firstViewOnly:      options.firstViewOnly         || false,
    key:                options.key                   || '',
    latency:            options.latency               || '',
    location:           options.location              || 'Dulles:Chrome',
    login:              options.login                 || '',
    packetLossRate:     options.packetLossRate        || '',
    password:           options.password              || '',
    pollResults:        options.pollResults           || 5,
    runs:               options.runs                  || 1,
    timeout:            options.timeout               || 60,
    url:                options.url                   || '',
    video:              options.video                 || 1,
    wptInstance:        options.wptInstance           || 'www.webpagetest.org',
    budget: {
      bytesIn:          options.budget.bytesIn        || '',
      bytesInDoc:       options.budget.bytesInDoc     || '',
      docTime:          options.budget.docTime        || '',
      fullyLoaded:      options.budget.fullyLoaded    || '',
      loadTime:         options.budget.loadTime       || '',
      render:           options.budget.render         || '1000',
      requests:         options.budget.requests       || '',
      requestsDoc:      options.budget.requestsDoc    || '',
      speedIndex:       options.budget.speedIndex     || '1000',
      visualComplete:   options.budget.visualComplete || ''
    }
  };

  // label
  // domelement
  // private
  // connections
  // web10
  // script
  // block
  // f
  // r
  // notify
  // pingback
  // tcpdump
  // noopt
  // noimages
  // noheaders
  // pngss
  // iq
  // noscript
  // clearcerts
  // mobile
  // uastring
  // width
  // height
  // dpr
  // mv
  // medianMetric
  // cmdline
  // htmlbody
  // tsview_id
  // custom
  // tester
  // affinity
  // timeline
  // timelineStack
  // ignoreSSL

  return function(callback) {
    console.log(callback);

    var processData = function(data) {
      console.log(data);

      /*var budget = options.budget,
          summary = data.data.summary,
          median = options.repeatView ? data.data.median.repeatView : data.data.median.firstView,
          pass = true,
          str = "";

      for (var item in budget) {
        // make sure this is objects own property and not inherited
        if (budget.hasOwnProperty(item)) {
          //make sure it exists
          if (budget[item] !== '' && median.hasOwnProperty(item)) {
            if (median[item] > budget[item]) {
              pass = false;
              str += item + ': ' + median[item] + ' [FAIL]. Budget is ' + budget[item] + '\n';
            } else {
              str += item + ': ' + median[item] + ' [PASS]. Budget is ' + budget[item] + '\n';
            }
          }
        }
      }

      //save the file before failing or passing
      var output = options.output;
      if (typeof output !== 'undefined') {
        gutil.log('Writing file: ' + output);
        grunt.file.write(output, JSON.stringify(data));
      }

      //
      //output our header and results
      if (!pass) {
        callback(new gutil.PluginError(PLUGIN_NAME, 'Test for ' + options.url + ' \t  FAILED'));
        callback(new gutil.PluginError(PLUGIN_NAME, str));
        callback(new gutil.PluginError(PLUGIN_NAME, 'Summary: ' + summary));
      } else {
        gutil.log('\n\n-----------------------------------------------' +
                    '\nTest for ' + options.url + ' \t  PASSED' +
                    '\n-----------------------------------------------\n\n');
        gutil.log(str);
        gutil.log('Summary: ' + summary);
        callback();
      }*/
    };

    var webPageTest = new WebPageTest(options.wptInstance, options.key),
        reserved = ['key', 'budget', 'firstViewOnly', 'url', 'wptInstance'],
        webPageTestSettings = {};

    for (var item in options) {
      if (reserved.indexOf(item) === -1 && options[item] !== '') {
        webPageTestSettings[item] = options[item];
      }
    }

    webPageTest.runTest(options.url, webPageTestSettings, function(error, data) {
      if (error) {
        var erroMessage;
        
        if (error.error) {
          if (error.error.code === 'TIMEOUT') {
            erroMessage = 'Test ' + error.error.testId + ' has timed out.'
                        + 'You can still view the results online at ' + options.wptInstance + '/results.php?test=' + error.error.testId + '.';
          } else {
            //we'll keep this just in case
            erroMessage = 'Test ' + error.error.testId + ' has errored. Error code: ' + error.error.code + '.';
          }
        } else {
          erroMessage = error.statusText || (error.code + ' ' + error.message);
        }

        cb(new gutil.PluginError(PLUGIN_NAME, erroMessage));
      } else if (data.statusCode === 200) {
        if (data.data.successfulFVRuns <= 0) {
          cb(new gutil.PluginError(PLUGIN_NAME, 'Test ' + data.data.testId + ' was unable to complete.'
                                              + 'Please see ' + data.data.summary + ' for more details.'));
        } else {
          console.log('OK');

          processData(data);
          // callback();
        }
      } else {
        callback(new gutil.PluginError(PLUGIN_NAME, data.data.statusText));
      }
    });
  }

};

module.exports = gulpWebPageTest;

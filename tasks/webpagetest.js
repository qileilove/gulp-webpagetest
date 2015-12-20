'use strict';

const PLUGIN_NAME = 'gulp-webpagetest';

var _           = require('lodash'),
    gulp        = require('gulp'),
    gutil       = require('gulp-util'),
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

  // key: API Key.
  // output: The file to output the JSON results to.
  // url: URL to be tested.
  // wptInstance: The WPT instance to conduct the tests with.
  var key         = options.key || '',
      output      = options.output || '',
      url         = options.url,
      wptInstance = options.wptInstance || 'www.webpagetest.org';

  delete options.key;
  delete options.output;
  delete options.url;
  delete options.wptInstance;

  /**
   * WebPageTest API settings.
   * @see https://sites.google.com/a/webpagetest.org/docs/advanced-features/webpagetest-restful-apis
   * 
   * @property {string}  connectivity   Connectivity type (DSL, Cable, FIOS, Dial, 3G, 3GFast, Native, custom).
   * @property {boolean} firstViewOnly  Set to 1 to skip the Repeat View test. <fvonly>
   * @property {integer} latency        First-hop Round Trip Time in ms (used when specifying a custom connectivity profile).
   * @property {string}  location       Location to test from.
   * @property {string}  login          User name to use for authenticated tests (HTTP authentication).
   * @property {integer} packetLossRate Packet loss rate - percent of packets to drop (NEED 'custom' connectivity). <plr>
   * @property {string}  password       Password to use for authenticated tests (HTTP authentication).
   * @property {integer} runs           Number of test runs (1-10 on the public instance).
   * @property {integer} timeout        Timeout (in seconds) for the tests to run.
   * @property {integer} video          Set to 1 to capture video (video is required for calculating Speed Index).
   */
  var webPageTestSettings = {
    connectivity:       options.connectivity          || 'Cable',
    firstViewOnly:      options.firstViewOnly         || false,
    latency:            options.latency               || 0,
    location:           options.location              || 'Dulles:Chrome',
    login:              options.login                 || '',
    packetLossRate:     options.packetLossRate        || '',
    password:           options.password              || '',
    runs:               options.runs                  || 1,
    timeout:            options.timeout               || 60,
    video:              options.video                 || 1,
  };

  /**
   * WebPageTest Budget settings.
   */
  var webPageTestBudget = {
    bytesIn:        options.budget.bytesIn        || 0,
    bytesInDoc:     options.budget.bytesInDoc     || 0,
    docTime:        options.budget.docTime        || 0,
    fullyLoaded:    options.budget.fullyLoaded    || 0,
    loadTime:       options.budget.loadTime       || 0,
    render:         options.budget.render         || 0,
    requests:       options.budget.requests       || 0,
    requestsDoc:    options.budget.requestsDoc    || 0,
    speedIndex:     options.budget.speedIndex     || 0,
    visualComplete: options.budget.visualComplete || 0
  };

  return function(callback) {
    var processData = function(data, callback) {
      var budgetGoalsAreReached = true,
          median = webPageTestSettings.firstViewOnly ? data.data.median.firstView : data.data.median.repeatView,
          medianProperty,
          message = "";

      for (medianProperty in webPageTestBudget) {
        if (webPageTestBudget[medianProperty] && median[medianProperty] > webPageTestBudget[medianProperty]) {
          budgetGoalsAreReached = false;
          message += '\t' + medianProperty + ': ' + median[medianProperty] + ' \t [FAIL]. Budget is ' + webPageTestBudget[medianProperty] + '.\n';
        } else {
          message += medianProperty + ': ' + median[medianProperty] + ' \t [PASS]. Budget is ' + webPageTestBudget[medianProperty] + '.\n';
        }
      }

      if (output) {
        var fs = require('fs');

        gutil.log('Writing file: ' + output + '.');

        fs.writeFileSync(output, JSON.stringify(data));
      }

      if (!budgetGoalsAreReached) {
        callback(new gutil.PluginError(PLUGIN_NAME, 'Test for ' + webPageTestSettings.url + ' \t  FAILED\n'
                                                  + message + '\n'
                                                  + 'Summary: ' + data.data.summary));
      } else {
        gutil.log();
        gutil.log('-----------------------------------------------\n' +
                + 'Test for ' + webPageTestSettings.url + ' \t  PASSED\n' +
                + '-----------------------------------------------\n\n');
        gutil.log();
        gutil.log(message);
        gutil.log('Summary: ' + data.data.summary);

        callback();
      }
    };

    var webPageTest = new WebPageTest(wptInstance, key);

    webPageTest.runTest(url, webPageTestSettings, function(error, data) {
      if (error) {
        var errorMessage;
        
        if (error.error) {
          if (error.error.code === 'TIMEOUT') {
            errorMessage = 'Test ' + error.error.testId + ' has timed out.'
                         + 'You can still view the results online at ' + webPageTestSettings.wptInstance + '/results.php?test=' + error.error.testId + '.';
          } else {
            errorMessage = 'Test ' + error.error.testId + ' has errored. Error code: ' + error.error.code + '.';
          }
        } else {
          errorMessage = error.statusText || (error.code + ' ' + error.message);
        }

        callback(new gutil.PluginError(PLUGIN_NAME, errorMessage));
      } else if (data.statusCode === 200) {
        if (data.data.successfulFVRuns <= 0) {
          callback(new gutil.PluginError(PLUGIN_NAME, 'Test ' + data.data.testId + ' was unable to complete.'
                                                    + 'Please see ' + data.data.summary + ' for more details.'));
        } else {
          processData(data, callback);
        }
      } else {
        callback(new gutil.PluginError(PLUGIN_NAME, data.statusText));
      }
    });
  };

};

module.exports = gulpWebPageTest;

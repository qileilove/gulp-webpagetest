const PLUGIN_NAME = 'gulp-webpagetest';

var _           = require('lodash'),
    chalk       = require('chalk'),
    fs          = require('fs'),
    gulp        = require('gulp'),
    gutil       = require('gulp-util'),
    http        = require('http'),
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
   * @property {string}  latency        First-hop Round Trip Time in ms (used when specifying a custom connectivity profile).
   * @property {string}  location       Location to test from.
   * @property {string}  login          User name to use for authenticated tests (HTTP authentication).
   * @property {integer} packetLossRate Packet loss rate - percent of packets to drop (NEED 'custom' connectivity). <plr>
   * @property {string}  password       Password to use for authenticated tests (HTTP authentication).
   * @property {string}  pollResults    Poll for results after test is scheduled at every <interval> seconds.
   * @property {integer} runs           Number of test runs (1-10 on the public instance).
   * @property {integer} timeout        Timeout (in seconds) for the tests to run.
   * @property {boolean} video          Set to true to capture video (video is required for calculating Speed Index).
   */
  var webPageTestSettings = {
    connectivity:       options.connectivity   || 'Cable',
    firstViewOnly:      options.firstViewOnly  || false,
    latency:            options.latency        || '',
    location:           options.location       || 'Dulles:Chrome',
    login:              options.login          || '',
    packetLossRate:     options.packetLossRate || 0,
    pollResults:        options.pollResults    || 5,
    password:           options.password       || '',
    runs:               options.runs           || 1,
    timeout:            options.timeout        || 60,
    video:              options.video          || true,
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
    // requests:       options.budget.requests       || 0, (this is an array of objects !)
    requestsDoc:    options.budget.requestsDoc    || 0,
    SpeedIndex:     options.budget.speedIndex     || 0,
    visualComplete: options.budget.visualComplete || 0
  };
  
  return function(callback) {
    var processData = function(data, callback) {
      var budgetGoalsAreReached = true,
          median = webPageTestSettings.firstViewOnly ? data.data.median.firstView : data.data.median.repeatView,
          medianProperty,
          budgetMessages = '';

      for (medianProperty in webPageTestBudget) {
        if (!webPageTestBudget[medianProperty]) {
          budgetMessages += '\n' + chalk.gray('[--]');
        } else if (median[medianProperty] > webPageTestBudget[medianProperty]) {
          budgetGoalsAreReached = false;
          budgetMessages += chalk.red('[KO]');
        } else if (webPageTestBudget[medianProperty]) {
          budgetMessages += chalk.green('[OK]');
        }

        budgetMessages += ' ' + medianProperty + ': ' + median[medianProperty];
        if (webPageTestBudget[medianProperty]) {
          budgetMessages += ' (' + (median[medianProperty] > webPageTestBudget[medianProperty]) ? chalk.red('>') : '<';
          budgetMessages += ' ' + chalk.gray(webPageTestBudget[medianProperty]);
        }
      }

      if (output) {
        gutil.log('Writing results in file  ' + chalk.magenta(output));

        fs.writeFileSync(output, JSON.stringify(data, null, 4));
      }

      console.log('\n' +
                  '-----------------------------------------------\n' +
                  'Test for ' + chalk.yellow(url) + ' ' + (budgetGoalsAreReached ? chalk.green('PASSED') : chalk.red('FAILED')) + '\n' +
                  '-----------------------------------------------' +
                  budgetMessages + '\n' +
                  '-------------------------------------------------------------------\n\n' +
                  'Summary: ' + chalk.blue(data.data.summary) + '\n');

      callback();
    };

    var webPageTest = new WebPageTest(wptInstance, key);

    return webPageTest.runTest(url, webPageTestSettings, function(responseError, response) {
      if (responseError) {
        var errorMessage;
        
        if (responseError.error) {
          if (responseError.error.code === 'TIMEOUT') {
            errorMessage = 'Test ' + responseError.error.testId + ' has timed out.' +
                           'You can still view the results online at ' + wptInstance + '/results.php?test=' + responseError.error.testId + '.';
          } else {
            errorMessage = 'Test ' + responseError.error.testId + ' has errored. Error code: ' + responseError.error.code + '.';
          }
        } else {
          errorMessage = responseError.statusText || (responseError.code + ' ' + responseError.message);
        }

        callback(new gutil.PluginError(PLUGIN_NAME, errorMessage));
      } else if (response.statusCode === 200) {
        if (response.data.successfulFVRuns <= 0) {
          callback(new gutil.PluginError(PLUGIN_NAME, 'Test ' + response.data.testId + ' was unable to complete.' +
                                                      'Please see ' + response.data.summary + ' for more details.'));
        } else {
          processData(response, callback);
        }
      } else {
        callback(new gutil.PluginError(PLUGIN_NAME, response.statusText));
      }
    });
  };

};

module.exports = gulpWebPageTest;

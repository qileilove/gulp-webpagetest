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
   *
   * @todo What to do with isResponsive ?
   * 
   * @property {integer} adult_site
   * @property {integer} aft
   * @property {integer} bytesIn
   * @property {integer} bytesInDoc
   * @property {integer} bytesOut
   * @property {integer} bytesOutDoc
   * @property {integer} cached
   * @property {integer} connections
   * @property {integer} date
   * @property {integer} docCPUms
   * @property {integer} docCPUpct
   * @property {integer} docTime
   * @property {integer} domContentLoadedEventEnd
   * @property {integer} domContentLoadedEventStart
   * @property {integer} domElements
   * @property {integer} domTime
   * @property {integer} effectiveBps
   * @property {integer} effectiveBpsDoc
   * @property {integer} firstPaint
   * @property {integer} fixed_viewport
   * @property {integer} fullyLoaded
   * @property {integer} fullyLoadedCPUms
   * @property {integer} fullyLoadedCPUpct
   * @property {integer} gzip_savings
   * @property {integer} gzip_total
   * @property {integer} image_savings
   * @property {integer} image_total
   * @property {integer} isResponsive               DISABLED
   * @property {integer} lastVisualChange
   * @property {integer} loadEventEnd
   * @property {integer} loadEventStart
   * @property {integer} loadTime
   * @property {integer} minify_savings
   * @property {integer} minify_total
   * @property {integer} optimization_checked
   * @property {integer} render
   * @property {array}   requests                   DISABLED
   * @property {integer} requestsDoc
   * @property {integer} requestsFull
   * @property {integer} responses_200
   * @property {integer} responses_404
   * @property {integer} responses_other
   * @property {integer} result
   * @property {integer} run
   * @property {integer} score_cache
   * @property {integer} score_cdn
   * @property {integer} score_combine
   * @property {integer} score_compress
   * @property {integer} score_cookies
   * @property {integer} score_etags
   * @property {integer} score_gzip
   * @property {integer} score_keep-alive
   * @property {integer} score_minify
   * @property {integer} score_progressive_jpeg
   * @property {integer} server_count
   * @property {integer} server_rtt
   * @property {integer} SpeedIndex
   * @property {integer} titleTime
   * @property {integer} TTFB
   * @property {array}   videoFrames                DISABLED
   * @property {integer} visualComplete
   */
  var webPageTestBudget = {
    'adult_site':                 options.budget['adult_site'] || 0,
    'aft':                        options.budget['aft'] || 0,
    'bytesIn':                    options.budget['bytesIn'] || 0,
    'bytesInDoc':                 options.budget['bytesInDoc'] || 0,
    'bytesOut':                   options.budget['bytesOut'] || 0,
    'bytesOutDoc':                options.budget['bytesOutDoc'] || 0,
    'cached':                     options.budget['cached'] || 0,
    'connections':                options.budget['connections'] || 0,
    'date':                       options.budget['date'] || 0,
    'docCPUms':                   options.budget['docCPUms'] || 0,
    'docCPUpct':                  options.budget['docCPUpct'] || 0,
    'docTime':                    options.budget['docTime'] || 0,
    'domContentLoadedEventEnd':   options.budget['domContentLoadedEventEnd'] || 0,
    'domContentLoadedEventStart': options.budget['domContentLoadedEventStart'] || 0,
    'domElements':                options.budget['domElements'] || 0,
    'domTime':                    options.budget['domTime'] || 0,
    'effectiveBps':               options.budget['effectiveBps'] || 0,
    'effectiveBpsDoc':            options.budget['effectiveBpsDoc'] || 0,
    'firstPaint':                 options.budget['firstPaint'] || 0,
    'fixed_viewport':             options.budget['fixed_viewport'] || 0,
    'fullyLoaded':                options.budget['fullyLoaded'] || 0,
    'fullyLoadedCPUms':           options.budget['fullyLoadedCPUms'] || 0,
    'fullyLoadedCPUpct':          options.budget['fullyLoadedCPUpct'] || 0,
    'gzip_savings':               options.budget['gzip_savings'] || 0,
    'gzip_total':                 options.budget['gzip_total'] || 0,
    'image_savings':              options.budget['image_savings'] || 0,
    'image_total':                options.budget['image_total'] || 0,
    'lastVisualChange':           options.budget['lastVisualChange'] || 0,
    'loadEventEnd':               options.budget['loadEventEnd'] || 0,
    'loadEventStart':             options.budget['loadEventStart'] || 0,
    'loadTime':                   options.budget['loadTime'] || 0,
    'minify_savings':             options.budget['minify_savings'] || 0,
    'minify_total':               options.budget['minify_total'] || 0,
    'optimization_checked':       options.budget['optimization_checked'] || 0,
    'render':                     options.budget['render'] || 0,
    'requestsDoc':                options.budget['requestsDoc'] || 0,
    'requestsFull':               options.budget['requestsFull'] || 0,
    'responses_200':              options.budget['responses_200'] || 0,
    'responses_404':              options.budget['responses_404'] || 0,
    'responses_other':            options.budget['responses_other'] || 0,
    'result':                     options.budget['result'] || 0,
    'run':                        options.budget['run'] || 0,
    'score_cache':                options.budget['score_cache'] || 0,
    'score_cdn':                  options.budget['score_cdn'] || 0,
    'score_combine':              options.budget['score_combine'] || 0,
    'score_compress':             options.budget['score_compress'] || 0,
    'score_cookies':              options.budget['score_cookies'] || 0,
    'score_etags':                options.budget['score_etags'] || 0,
    'score_gzip':                 options.budget['score_gzip'] || 0,
    'score_keep-alive':           options.budget['score_keep-alive'] || 0,
    'score_minify':               options.budget['score_minify'] || 0,
    'score_progressive_jpeg':     options.budget['score_progressive_jpeg'] || 0,
    'server_count':               options.budget['server_count'] || 0,
    'server_rtt':                 options.budget['server_rtt'] || 0,
    'SpeedIndex':                 options.budget['SpeedIndex'] || 0,
    'titleTime':                  options.budget['titleTime'] || 0,
    'TTFB':                       options.budget['TTFB'] || 0,
    'visualComplete':             options.budget['visualComplete'] || 0
  };
  
  return function(callback) {
    var processData = function(data, callback) {
      var budgetGoalsAreReached = true,
          median = webPageTestSettings.firstViewOnly ? data.data.median.firstView : data.data.median.repeatView,
          medianProperty,
          budgetMessages = '';

      for (medianProperty in webPageTestBudget) {
        if (!webPageTestBudget[medianProperty]) {
          budgetMessages += '\n[' + chalk.gray('--') + ']';
        } else if (median[medianProperty] > webPageTestBudget[medianProperty]) {
          budgetGoalsAreReached = false;
          budgetMessages += '\n[' + chalk.red('KO') + ']';
        } else if (webPageTestBudget[medianProperty]) {
          budgetMessages += '\n[' + chalk.green('OK') + ']';
        }

        budgetMessages += ' ' + medianProperty + ': ' + median[medianProperty];
        if (webPageTestBudget[medianProperty]) {
          budgetMessages += chalk.blue(' (');
          budgetMessages += (median[medianProperty] > webPageTestBudget[medianProperty]) ? chalk.red('>') : chalk.blue('<');
          budgetMessages += chalk.blue(' ' + webPageTestBudget[medianProperty] + ')');
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

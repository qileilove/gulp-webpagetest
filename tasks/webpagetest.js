'use strict';

const PLUGIN_NAME = 'gulp-webpagetest';

var _           = require('lodash'),
    gulp        = require('gulp'),
    gutil       = require('gulp-util'),
    PluginError = gutil.PluginError;

module.exports = function(options) {
  if (!options) {
    throw new PluginError(PLUGIN_NAME, 'When calling webpagetest(options), options parameter is MANDATORY.');
  }

  if (!_.isPlainObject(options)) {
    throw new PluginError(PLUGIN_NAME, 'When calling webpagetest(options), options MUST be an object.');
  }

  if (!options.url) {
    throw new PluginError(PLUGIN_NAME, 'Missing options.url property in webpagetest(options) call.');
  }

  if (!options.budget) {
    options.budget = {};
  }

  var options = {
    url:                options.url                   || '',
    key:                options.key                   || '',
    location:           options.location              || 'Dulles:Chrome',
    wptInstance:        options.wptInstance           || 'www.webpagetest.org',
    connectivity:       options.connectivity          || '',
    bandwidthDown:      options.bandwidthDown         || '',
    bandwidthUp:        options.bandwidthUp           || '',
    latency:            options.latency               || '',
    packetLossRate:     options.packetLossRate        || '',
    login:              options.login                 || '',
    password:           options.password              || '',
    authenticationType: options.authenticationType    || '',
    video:              options.video                 || 1,
    runs:               options.runs                  || 1,
    pollResults:        options.pollResults           || 5,
    timeout:            options.timeout               || 60,
    repeatView:         options.repeatView            || false,
    budget: {
      visualComplete:   options.budget.visualComplete || '',
      render:           options.budget.render         || '1000',
      loadTime:         options.budget.loadTime       || '',
      docTime:          options.budget.docTime        || '',
      fullyLoaded:      options.budget.fullyLoaded    || '',
      bytesIn:          options.budget.bytesIn        || '',
      bytesInDoc:       options.budget.bytesInDoc     || '',
      requests:         options.budget.requests       || '',
      requestsDoc:      options.budget.requestsDoc    || '',
      SpeedIndex:       options.budget.SpeedIndex     || '1000'
    }
  };

  console.log(options);
};

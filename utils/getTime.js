/**
 * Get now time as HH:MM:SS format
 */
var getTime = function() {
  var date = new Date(),
      hours = date.getHours().toString(),
      minutes = date.getMinutes().toString(),
      seconds = date.getSeconds().toString();

  return [
    hours[1] ? '' : '0', hours, ':',
    minutes[1] ? '' : '0', minutes, ':',
    seconds[1] ? '' : '0', seconds
  ].join('');
};

module.exports = getTime;

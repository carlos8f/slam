function round (num, places) {
  if (places === 0) return Math.round(num);
  if (!places) places = 2;

  var split = String(num).split('.');
  if (split[1]) {
    split[1] = split[1].substr(0, places);
  }
  else {
    split[1] = '00';
  }
  return split.join('.');
}

function mb (bytes) {
  return round(bytes / (1024 * 1024));
}

function repeat (c, len) {
  var ret = '';
  while (ret.length < len) ret += c;
  return ret;
}

module.exports = function report (input, done) {
  var results = input.results
    , errs = input.errs
    , log = input.log
    , started = input.started
    , concurrencySamples = input.concurrencySamples

  var total = results.length + errs.length;

  var transferred = results.reduce(function (prev, result) {
    return prev + result.size;
  }, 0);

  var responseTime = results.reduce(function (prev, result) {
    return prev + result.time;
  }, 0) / results.length;

  var longest = results.reduce(function (prev, result) {
    return Math.max(prev, result.time);
  }, 0);

  var shortest = results.reduce(function (prev, result) {
    return Math.min(prev, result.time);
  }, 0);

  var concurrency = Object.keys(concurrencySamples).reduce(function (prev, id) {
    return prev + concurrencySamples[id];
  }, 0) / Object.keys(concurrencySamples).length;

  var elapsed = ((new Date()).getTime() - started.getTime());

  function stat (title, val, suffix) {
    val = String(val);
    suffix || (suffix = '');
    var line = title + ': ';
    line += repeat(' ', 35 - line.length - val.length);
    line += val + ' ' + suffix;
    log(line);
  }

  log();
  stat('Transactions', total, 'hits');
  stat('Availability', round((results.length / total) * 100), '%');
  stat('Elapsed time', round(elapsed / 1000), 'secs');
  stat('Data transferred', mb(transferred), 'MB');
  stat('Response time', round(responseTime / 1000), 'secs');
  stat('Transaction rate', round(total / (elapsed / 1000)), 'trans/sec');
  stat('Throughput', mb(transferred / (elapsed / 1000)), 'MB/sec');
  stat('Concurrency', round(concurrency));
  stat('Successful transactions', results.length);
  stat('Failed transactions', errs.length);
  stat('Longest transaction', round(longest / 1000));
  stat('Shortest transaction', round(shortest / 1000));
  log();

  done();
};

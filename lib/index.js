var cluster = require('cluster')
  , resolve = require('path').resolve
  , fs = require('fs')
  , bytes = require('bytes')

module.exports = function slam (options, cb) {
  var workerCount = 0
    , results = []
    , errs = []
    , stream = options.out ? fs.createWriteStream(resolve(options.out)) : process.stdout
    , started
    , timer

  function log (str) {
    stream.write((str || '') + '\n');
  }

  function sendAll (message) {
    Object.keys(cluster.workers).forEach(function (id) {
      cluster.workers[id].send(message);
    });
  }

  cluster.setupMaster({
    exec: resolve(__dirname, './worker.js')
  });

  for (var i = 0; i < options.concurrency; i++) {
    var worker = cluster.fork();
    worker.on('message', function (message) {
      if (message.cmd === 'SLAM_OK') {
        workerCount++;
        if (workerCount === options.concurrency) {
          log('\n' + options.name + ' v' + options.version + '\n' + new Date() + '\n');
          log('slamming ' + options.url + ' x' + options.concurrency + ' for ' + options.time + 's...');
          started = new Date();
          timer = setTimeout(function () {
            sendAll({cmd: 'SLAM_STOP'});
            report(cb);
          }, options.time * 1000);
          sendAll({cmd: 'SLAM_START'});
        }
      }
      else if (message.cmd === 'SLAM_RESULT') {
        results.push(message)
      }
      else if (message.cmd === 'SLAM_ERR') {
        errs.push(message);
      }
    });
    worker.send({cmd: 'SLAM_OPTIONS', options: options});
  }

  function round (num, places) {
    if (places === 0) return Math.round(num);
    if (!places) places = 2;

    var split = String(num).split('.');
    if (split[1]) {
      split[1] = split[1].substr(0, places);
    }
    return split.join('.');
  }

  function report (done) {
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
    var elapsed = ((new Date()).getTime() - started.getTime());

    log('\nTransactions: ' + total + ' hits');
    log('Availability: ' + round((results.length / total) * 100) + ' %');
    log('Elapsed time: ' + round(elapsed / 1000) + ' secs');
    log('Data transferred: ' + bytes(transferred));
    log('Response time: ' + round(responseTime / 1000) + ' secs');
    log('Transaction rate: ' + round(total / (elapsed / 1000)) + ' trans/sec');
    log('Throughput: ' + bytes(Math.round(transferred / (elapsed / 1000))) + '/sec');
    log('Successful transactions: ' + results.length);
    log('Failed transactions: ' + errs.length);
    log('Longest transaction: ' + round(longest / 1000));
    log('Shortest transaction: ' + round(shortest / 1000));
    log();
    done();
  }
};
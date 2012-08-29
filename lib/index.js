var cluster = require('cluster')
  , resolve = require('path').resolve
  , fs = require('fs')
  , parseUrl = require('url').parse
  , report = require('./report')

module.exports = function slam (options, cb) {
  var workerCount = 0
    , workersStopped = 0
    , results = []
    , errs = []
    , stream = options.out ? fs.createWriteStream(resolve(options.out)) : process.stdout
    , started
    , timer

  options.url = parseUrl(options.url);
  options.url.port || (options.url.port = 80);
  options.url.hostname || (options.url.hostname = 'localhost');

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
          log('slamming ' + options.url.href + ' x' + options.concurrency + ' for ' + options.time + 's...');
          started = new Date();
          timer = setTimeout(function () {
            sendAll({cmd: 'SLAM_STOP'});
          }, options.time * 1000);
          sendAll({cmd: 'SLAM_START'});
        }
      }
      else if (message.cmd === 'SLAM_RESULTS') {
        results = results.concat(message.results);
        errs = errs.concat(message.errs);
        workersStopped++;
        if (workersStopped === workerCount) {
          report({
            results: results,
            errs: errs,
            log: log,
            started: started
          }, cb);
        }
      }
    });
    worker.send({cmd: 'SLAM_OPTIONS', options: options});
  }
};
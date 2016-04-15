var cluster = require('cluster')
  , resolve = require('path').resolve
  , fs = require('fs')
  , parseUrl = require('url').parse
  , report = require('./report')
  , idgen = require('idgen')
  , minimist = require('minimist')

module.exports = function slam (options, cb) {
  var workerCount = 0
    , workersStopped = 0
    , results = []
    , errs = []
    , stream = options.out ? fs.createWriteStream(resolve(options.out)) : process.stdout
    , started
    , timer
    , concurrencySamples = {}
    , concurrencyInterval

  options.headers = minimist(options.rawArgs, {
    alias: { H: 'header' },
    string: ['header']
  }).header || [];
  options.headers = Array.isArray(options.headers)
    ? options.headers
    : [ options.headers ];

  options.url = parseUrl(options.url);
  options.url.port || (options.url.port = 80);
  options.url.hostname || (options.url.hostname = 'localhost');

  function log (str) {
    if (options.json) {
      console.error(str);
    }
    else {
      stream.write((str || '') + '\n');
    }
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
          log(options.name + ' v' + options.version + '\n' + new Date() + '\n');
          log('slamming ' + options.url.href + ' x' + options.concurrency + ' for ' + options.time + 's...');
          started = new Date();
          timer = setTimeout(stop, options.time * 1000);
          sendAll({cmd: 'SLAM_START'});
        }
      }
      else if (message.cmd === 'SLAM_RESULTS') {
        results = results.concat(message.results);
        errs = errs.concat(message.errs);
        workersStopped++;
        if (workersStopped === workerCount) {
          clearInterval(concurrencyInterval);
          report({
            concurrencySamples: concurrencySamples,
            results: results,
            errs: errs,
            stream: stream,
            started: started,
            json: options.json
          }, function (err, content) {
            if (err) return cb(err);
            stream.write(content);
            cb();
          });
        }
      }
      else if (message.cmd === 'SLAM_POLL') {
        concurrencySamples[message.id] || (concurrencySamples[message.id] = 0);
        concurrencySamples[message.id]++;
      }
    });
    worker.send({cmd: 'SLAM_OPTIONS', options: options});
  }

  concurrencyInterval = setInterval(function () {
    sendAll({cmd: 'SLAM_POLL', id: idgen()});
  }, 100);

  function stop () {
    process.stdin.resume();
    clearTimeout(timer);
    sendAll({cmd: 'SLAM_STOP'});
  }

  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
};
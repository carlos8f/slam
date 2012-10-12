var options
  , createConnection = require('net').createConnection
  , go = false
  , results = []
  , errs = []
  , format = require('util').format
  , inRequest = false

process.on('message', function (message) {
  if (message.cmd === 'SLAM_OPTIONS') {
    options = message.options;
    process.send({cmd: 'SLAM_OK'});
  }
  else if (message.cmd === 'SLAM_START') {
    go = true;
    hit();
  }
  else if (message.cmd === 'SLAM_STOP') {
    go = false;
    process.send({cmd: 'SLAM_RESULTS', results: results, errs: errs});
  }
  else if (message.cmd === 'SLAM_POLL' && go && inRequest) {
    process.send({cmd: 'SLAM_POLL', id: message.id});
  }
});

function hit () {
  var didNext = false
    , started = new Date()

  function next () {
    if (go && !didNext) {
      didNext = true;
      hit();
    }
  }

  var req = format('GET %s HTTP/1.1\r\n', options.url.path)
    + format('Host: %s\r\n', options.url.host)
    + format('Accept-Encoding: gzip,deflate,sdch\r\n')
    + format('Connection: keep-alive')
    + 'Connection: close\r\n\r\n';

  var data = '';

  var socket = createConnection(options.url.port, options.url.hostname);
  socket.on('connect', function () {
    inRequest = true;
    socket.write(req);
  });
  socket.on('data', function (chunk) {
    data += chunk;
  });
  socket.once('end', function () {
    inRequest = false;
    results.push({
      time: ((new Date()).getTime() - started.getTime()),
      size: data.length
    });
    next();
  });
  socket.once('error', function (err) {
    errs.push(err);
    next();
  });
}

process.on('SIGINT', function () {
  // Wait for master to exit gracefully
});
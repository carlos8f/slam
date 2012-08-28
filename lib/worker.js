var options
  , get = require('http').get
  , go = false

process.on('message', function (message) {
  if (message.cmd === 'SLAM_OPTIONS') {
    options = message.options;
    process.send({cmd: 'SLAM_OK'});
  }
  else if (message.cmd === 'SLAM_START') {
    start();
  }
  else if (message.cmd === 'SLAM_STOP') {
    go = false;
  }
});

function start () {
  go = true;
  (function hit () {
    var didNext = false
      , started = new Date()

    var req = get(options.url, function (res) {
      var data = '';
      res.on('data', function (chunk) {
        data += chunk;
      });
      res.once('end', function () {
        var message = {
          cmd: 'SLAM_RESULT',
          code: res.statusCode,
          time: ((new Date()).getTime() - started.getTime()),
          size: data.length
        };
        process.send(message);
        if (go && !didNext) process.nextTick(hit);
        didNext = true;
      });
    });
    req.once('error', function (err) {
      process.send({cmd: 'SLAM_ERR', err: err});
      if (go && !didNext) process.nextTick(hit);
      didNext = true;
    });
  })();
}
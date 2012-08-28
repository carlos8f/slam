var options
  , get = require('http').get
  , go = false
  , results = []
  , errs = []

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

  var req = get(options.url, function (res) {
    var data = '';
    res.on('data', function (chunk) {
      data += chunk;
    });
    res.once('end', function () {
      results.push({
        time: ((new Date()).getTime() - started.getTime()),
        size: data.length
      });
      next();
    });
  });
  req.once('error', function (err) {
    errs.push(err);
    next();
  });
}
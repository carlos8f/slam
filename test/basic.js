describe('basic test', function () {
  var server
    , port

  before(function (done) {
    server = createServer(function (req, res) {
      res.end('hello world!');
    });

    server.listen(0, function () {
      port = server.address().port;
      done();
    });
  });

  after(function (done) {
    server.once('close', done);
    server.close();
  });

  it('can slam the server', function (done) {
    var output = '';

    var slam = execFile(resolve(__dirname, '../bin/slam'), ['-t', '2s', 'http://localhost:' + port + '/']);

    slam.stdout.on('data', function (chunk) {
      output += chunk;
    });
    slam.stderr.on('data', function (chunk) {
      output += chunk;
    });

    slam.once('close', function () {
      assert(output.match(/slam v[\d\.]+/));
      assert(output.match(/slamming http:\/\/localhost:\d+\/ x10 for 2s\.{3}/));

      var match = output.match(/([\d\.]+) trans\/sec/);
      assert(match);

      var trans = parseFloat(match[1]);
      assert(trans > 0);

      var match = output.match(/Failed transactions:\s+([\d\.]+)/);
      assert(match);

      var failed = parseFloat(match[1]);
      assert.equal(failed, 0);

      done();
    });
  });
});
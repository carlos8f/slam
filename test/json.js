describe('json', function () {
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

  it('outputs json', function (done) {
    var output = '';

    var slam = execFile(resolve(__dirname, '../bin/slam.js'), ['-t', '2s', '--json', 'http://localhost:' + port + '/']);

    slam.stdout.on('data', function (chunk) {
      output += chunk;
    });

    slam.once('close', function (code) {
      output = JSON.parse(output);

      assert.equal(typeof output['Transactions'], 'number');
      assert(output['Transactions'] > 0);

      assert.equal(typeof output['Transaction rate'], 'number');
      assert(output['Transaction rate'] > 0);

      assert.equal(typeof output['Failed transactions'], 'number');
      assert.strictEqual(output['Failed transactions'], 0);

      done();
    });
  });
});
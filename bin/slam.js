#!/usr/bin/env node
var version = require(require('path').resolve(__dirname, '../package.json')).version

var program = require('commander')
  .version(version)
  .usage('[options] url')
  .option('-c, --concurrency <num>', 'level of concurrency (default: 10)', Number, 10)
  .option('-t, --time <seconds>', 'length of benchmark (default: 30)', Number, 30)
  .option('-o, --out <outfile>', 'write results to a file')
  .option('--json', 'output a json representation of the data')
  .parse(process.argv)

if (!program.args[0]) {
  console.error(program.helpInformation());
  process.exit(1);
}

program.url = program.args[0];
program.version = version;

require('../')(program, function (err) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  process.exit();
});
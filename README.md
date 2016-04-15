slam
====

Pure node benchmarker alternative to `ab` or `siege`

[![build status](https://secure.travis-ci.org/carlos8f/slam.png)](http://travis-ci.org/carlos8f/slam)

Install
-------

```bash
$ npm install -g slam
```

Usage
-----

```

  Usage: slam [options] url

  Options:

    -h, --help               output usage information
    -V, --version            output the version number
    -c, --concurrency <num>  level of concurrency (default: 10)
    -t, --time <seconds>     length of benchmark (default: 30)
    -H, --header <header>    send a custom HTTP header (repeatable)
    -o, --out <outfile>      write results to a file
    --json                   output a json representation of the data

```

Sample output
-------------

### text

```
slam v1.0.1
Tue Aug 28 2012 18:13:03 GMT-0700 (PDT)

slamming http://localhost:8080/README.md x5 for 10s...

Transactions:                 47116 hits
Availability:                100.00 %
Elapsed time:                 10.05 secs
Data transferred:             15.45 MB
Response time:                 0.00 secs
Transaction rate:           4684.43 trans/sec
Throughput:                    1.53 MB/sec
Concurrency:                   2.83 
Successful transactions:      47116 
Failed transactions:              0 
Longest transaction:           0.05 
Shortest transaction:          0.00 
```

### json

```javascript
{
 "Transactions": 46957,
 "Availability": 100,
 "Elapsed time": 10.06,
 "Data transferred": 15.4,
 "Response time": 0,
 "Transaction rate": 4665.37,
 "Throughput": 1.53,
 "Concurrency": 3.62,
 "Successful transactions": 46957,
 "Failed transactions": 0,
 "Longest transaction": 0.05,
 "Shortest transaction": 0
}
```

- - -

### Developed by [Terra Eclipse](http://www.terraeclipse.com)
Terra Eclipse, Inc. is a nationally recognized political technology and
strategy firm located in Aptos, CA and Washington, D.C.

- - -

### License: MIT

- Copyright (C) 2012 Carlos Rodriguez (http://s8f.org/)
- Copyright (C) 2012 Terra Eclipse, Inc. (http://www.terraeclipse.com/)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished
to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
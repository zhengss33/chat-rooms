const http = require('http');
const parse = require('url').parse;
const join = require('path').join;
const fs = require('fs');
const _root = __dirname;

const server = http.createServer(function(req, res) {
  const url = parse(req.url);
  const path = join(_root, url.pathname);

  // stream.on('data', (chunk) => {
  //   res.write(chunk);
  // });
  //
  // stream.on('end', () => {
  //   res.end();
  // });
  fs.stat(path, (err, stat) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.statusCode = 404;
        res.end('Not Found');
      } else {
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    } else {
      const stream = fs.createReadStream(path);
      res.setHeader('Content-Length', stat.size)
      stream.pipe(res);
      stream.on('error', (err) => {
        res.statusCode = 500;
        res.end('Internal Server Error');
      });
    }
  });
});

server.listen(3000, () => {
  console.log('server listening on 3000');
})

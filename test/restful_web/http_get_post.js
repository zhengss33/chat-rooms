const http = require('http');
const url = require('url');
let items = [];

const server = http.createServer(function(req, res) {
  let item = '';
  let path, id;

  switch (req.method) {
    case 'POST':
      req.setEncoding('utf-8');
      req.on('data', (chunk) => {
        item += chunk;
      });
      req.on('end', () => {
        items.push(item);
        res.end('200');
      });
      break;

    case 'GET':
      items.forEach((item, i) => {
        res.write(`${i}) ${item}\n`);
      });
      res.end();
      break;

    case 'PUT':
      path = url.parse(req.url).pathname;
      id = parseInt(path.slice(1), 10);
      item = '';

      req.setEncoding('utf-8');
      req.on('data', (chunk) => {
        item += chunk;
      });
      req.on('end', () => {
        if (typeof id !== 'number') {
          res.statusCode = 400;
          res.end('Invalid item id');
        } else if (!items[id]) {
          res.statusCode = 404;
          res.end('item not found');
        } else {
          items.splice(id, 1, item);
          res.end('OK\n');
        }
      });
      break;

    case 'DELETE':
      path = url.parse(req.url).pathname;
      id = parseInt(path.slice(1), 10);

      if (typeof id !== 'number') {
        res.statusCode = 400;
        res.end('Invalid item id');
      } else if (!items[id]) {
        res.statusCode = 404;
        res.end('item not found');
      } else {
        items.splice(id, 1);
        res.end('OK\n');
      }
      break;
  }
});

server.listen(3000, () => {
  console.log('server listening on 3000');
});

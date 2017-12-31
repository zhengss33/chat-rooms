const http = require('http');
const qs = require('querystring');
let items = [];

const server = http.createServer(function (req, res) {
  if (req.url === '/') {
    switch (req.method) {
      case 'GET':
        show(res);
        break;

      case 'POST':
        add(req, res);
        break;

      default:
        badRequest(res);
    }
  } else {
    notFound(res);
  }
});

server.listen(3000);


function show(res) {
  let list = items.toString().replace(/,/g, '</li><li>');
  let temp = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Todo List</title>
      </head>
      <body>
        <h1>Todo List</h1>
        <ul>
          <li>${list}</li>
        </ul>
        <form method="post" action="/">
          <p><input type="text" name="item" /></p>
          <p><input type="submit" value="Add Item"/></p>
        </form>
      </body>
    </html>
  `;
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Length', Buffer.byteLength(temp));
  res.end(temp);
}

function add(req, res) {
  let item = '';

  req.setEncoding('utf-8');
  req.on('data', (chunk) => { item += chunk });
  req.on('end', () => {
    let obj = qs.parse(item);
    items.push(obj.item);
    show(res);
  });
}

function badRequest(res) {
  res.statusCode = 500;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Bad Request');
}

function notFound(res) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Not Found');
}

const connect = require('connect');
const parse = require('url').parse;
const api = connect()
              .use(users)
              .use(pets)
              .use(errorHandler);

const app = connect()
              .use(hello)
              .use(api)
              .use(errorPage)
              .listen(3000);

function hello(req, res, next) {
  let pathname = parse(req.url).pathname;
  let match = pathname.match(/^\/hello/);

  if (match) {
    res.end('Hello world!\n');
  } else {
    next();
  }
}

function users(req, res, next) {
  let db = {
    users: [
      { name: 'tobi' },
      { name: 'loki' },
      { name: 'jane' },
    ],
  };
  let pathname = parse(req.url).pathname;
  let match = pathname.match(/^\/user\/(.+)/);

  if (match) {
    let user = db.users[match[1]];
    if (user) {
      res.setHeader('Content-Type', 'text/plain');
      res.end(JSON.stringify(user));
    } else {
      let err = new Error('User not found');
      err.notFound = true;
      next(err);
    }
  } else {
    next();
  }
}

function pets(req, res, next) {
  let pathname = parse(req.url).pathname;
  let match = pathname.match(/^\/pet\/(.+)/);

  if (match) {
    foo();
  } else {
    next();
  }
}

function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.setHeader('Content-Type', 'application/json');
  if (err.notFound) {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: err.message }));
  } else {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
}

function errorPage(err, req, res, next) {
  console.error(err.stack);
  if (err) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
  res.end();
}

const connect = require('connect');

connect()
  .use(logger(':method :url'))
  .use(hello)
  .listen(3000);


function logger(format) {
  let reg = /:(\w+)/g;

  return function(req, res, next) {
    let str = format.replace(reg, (match, property) => {
      return req[property];
    });
    console.log(str);
    next();
  }
}

function hello(req, res, next) {
  res.setHeader('Content-Type', 'text/palin');
  res.end('Hello')
}

const parse = require('url').parse;

module.exports = function router (obj) {
  return function (req, res, next) {
    if (!obj[req.method]) {
      next();
      return;
    }
    let routes = obj[req.method];
    let paths = Object.keys(routes);
    let url = parse(req.url);

    for (var i = 0; i < paths.length; i++) {
      let path = paths[i];
      let fn = routes[path];
      path = path.replace(/\//g, '\\/')
                 .replace(/:(\w+)/g, '([^\\/]+)');
      let reg = new RegExp('^' + path + '$');
      let captures = url.pathname.match(reg);
      if (captures) {
        fn(...[req, res, ...(captures.slice(1))]);
        return;
      }
    }
  }
}

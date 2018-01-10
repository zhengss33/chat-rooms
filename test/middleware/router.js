const parse = require('url').parse;

module.exports = function router (obj) {
  return function (req, res, next) {
    let routes = obj[req.method];
    if (!routes) {
      next();
      return;
    }

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
        let id = captures.slice(1);
        fn(req, res, id);
        return;
      }
    }
  }
}

const connect = require('connect');
const router = require('./router');
const routes = {
  'GET': {
    '/users': function(req, res) {
      res.end('users');
    },
    '/user/:id': function(req, res, id) {
      res.end(`user: ${id}`)
    }
  },
  'DELETE': {
    '/user/:id': function(req, res, id) {
      res.end(`delete user: ${id}`)
    }
  },
}

connect()
  .use(router(routes))
  .listen(3000);

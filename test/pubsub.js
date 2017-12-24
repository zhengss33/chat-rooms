
const events = require('events');
const net = require('net');
let channel = new events.EventEmitter();
channel.clients = {};  // 客户端
channel.subscriptions = {};  // 订阅

// 加入聊天室时
channel.on('join', function(id, client) {
  this.clients[id] = client;
  this.subscriptions[id] = function(senderId, message) {
    if (id != senderId) {
      this.clients[id].write(message);
    }
  }
  // 有广播时
  this.on('broadcast', this.subscriptions[id]);
});

// 离开聊天室时移除广播, 并广播提示
channel.on('leave', function(id) {
  channel.removeListener('broadcast', this.subscriptions[id]);
  channel.emit('broadcast', id, `${id} has left the chat.\n`);
});

channel.on('shutdown', function() {
  channel.emit('broadcast', 'Chat has shut down.\n');
  channel.removeAllListeners('broadcast');
});

const server = net.createServer(function(client) {
  let id = `${client.remoteAddress}: ${client.remotePort}`;

  client.write('welcome\n');

  // 连接时触发进入聊天室
  channel.emit('join', id, client);
  // 有数据时广播
  client.on('data', (data) => {
    data = data.toString();
    if (data == 'shutdown\r\n') {
      channel.emit('shutdown');
    }
    channel.emit('broadcast', id, data);
  });
  // 关闭时触发离开
  client.on('close', () => {
    channel.emit('leave', id);
  });
}).listen(3000, () => {
  console.log('Server listening on port 3000');
});

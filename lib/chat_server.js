const socketio = require('socket.io');
let io,
    guestNumber = 1,
    nickNames = {},
    namesUsed = [],
    currentRoom = {};

exports.listen = function (server) {
  // 启动Socket.IO, 允许它搭载在已有的HTTP服务器上
  io = socketio(server);
  io.set('log level', 1);

  // 定义每个用户连接上的处理逻辑
  io.sockets.on('connection', (socket) => {
    // 分配访客名
    guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);

    // 默认进入聊天室Lobby
    joinRoom(socket, 'Lobby');

    // 处理用户消息
    handleMessageBroadcasting(socket, nickNames);

    // 用户更名
    handleNameChangeAttempts(socket, nickNames, namesUsed);

    // 聊天室的创建以及变更
    handleRoomJoining(socket);

    // 用户发出请求时,向其提供已经被占用的聊天室列表
    socket.on('rooms', () => {
      socket.emit('rooms', io.sockets.manager.rooms);
    });

    // 用户断开连接时清除
    handleClientDisconnection(socket, nickNames, namesUsed);
  });
}

// 分配用户昵称
function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
  const name = `Guest${guestNumber}`;
  // 将用户昵称跟客户端连接ID关联
  nickNames[socket.id] = name;
  namesUsed.push(name);
  socket.emit('nameResult', {
    success: true,
    name: name,
  });
  return guestNumber + 1;
};

// 进入聊天室
function joinRoom(socket, room) {
  // 让=用户进入房间
  socket.join(room);
  currentRoom[socket.id] = room;
  socket.emit('joinResult', { room: room });
  // 让房间其他用户得知新用户进入房间
  socket.broadcast.to(room).emit('messages', {
    text: `${nickNames[socket.id] has joined ${room}.}`;
  });

  let usersInRoom = io.sockets.clients(room);
  if (usersInRoom.length > 1) {
    let usersInRoomSummary = `Users currently in ${room}:`;
    for (var i in usersInRoom) {
      let userSocketId = usersInRoom[index].id;
      if (userSocketId != socket.id) {
        if (i > 0) {
          usersInRoomSummary += ', ';
        }
        usersInRoomSummary += nickNames[userSocketId];
      }
    }
    usersInRoomSummary += '.';
    socket.emit('messages', { text: usersInRoomSummary });
  }
}

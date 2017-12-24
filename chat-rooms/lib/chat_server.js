const socketio = require('socket.io');
let io,
    guestNumber = 1,
    nickNames = {},
    namesUsed = [],
    currentRoom = {};

exports.listen = function (server) {
  // 启动Socket.IO, 允许它搭载在已有的HTTP服务器上
  io = socketio.listen(server);
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
    text: `${nickNames[socket.id]} has joined ${room}.`,
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

function handleNameChangeAttempts(socket, nickNames, namesUsed) {
  socket.on('nameAttempt', (name) => {
    // 昵称不能以 "Guest" 开头
    if (name.indexOf('Guset') === 0) {
      socket.emit('nameResult', {
        success: false,
        message: 'Names cannot begin with "Guest"',
      });
    } else {
      // 昵称未注册
      if (namesUsed.indexOf(name) === -1) {
        let previousName = nickNames[socket.id];
        let previousIndex = namesUsed.indexOf(previousName);
        namesUsed.push(name);
        nickNames[socket.id] = name;
        delete namesUsed[previousIndex];
        socket.emit('nameResult', {
          success: true,
          name: name,
        });
        socket.broadcast.to(currentRoom[socket.id]).emit('message', {
          text: `${previousName} is now known as ${name}.`,
        });
      } else {
        // 昵称已注册
        socket.emit('nameResult', {
          success: false,
          message: 'That name is already in use',
        });
      }
    }
  });
}

function handleMessageBroadcasting(socket) {
  socket.on('message', (message) => {
    socket.broadcast.to(message.room).emit('message', {
      text: `${nickNames[socket.id]}: ${message.text}`,
    });
  });
}

function handleRoomJoining(socket) {
  socket.on('join', (room) => {
    socket.leave(currentRoom[socket.id]);
    joinRoom(socket, room.newRoom);
  });
}

function handleClientDisconnection(socket) {
  socket.on('disconnect', () => {
    let nameIndex = namesUsed.indexOf(nickNames[socket.id]);
    delete namesUsed[nameIndex];
    delete nickNames[socket.id];
  });
}

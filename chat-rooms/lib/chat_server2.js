const socketio = require('socket.io');
let io;
let guestNumber = 0;
let nameUsed = [];
let nikeNames = {};
let currentRoom = {};

exports.listen = function(server) {
  io = socketio(server);
  io.socket.on('connection', function(socket) {
    guestNumber = assignGuestName(socket, guestNumber, nameUsed, nikeNames);
    joinRoom(socket, 'tobi');
  });
}

function assignGuestName(socket, guestNumber, nameUsed, nikeNames) {
  let name = `Guest${guestNumber}`;
  nikeNames[socket.id] = name;
  nameUsed.push(name);
  socket.emit('nameResult', {
    success: true,
    name,
  });
  return guestNumber + 1;
}

function handleNameChangeAttempts(socket, nikeNames, nameUsed) {
  socket.on('nameAttemp', function(name) {
    if (name.indexOf('Guest') === 0) {
      socket.emit('nameResult', {
        success: false,
        message: 'Name cannot begin with "Guest"',
      });
    } else {
      if (nameUsed.indexOf(name) === -1) {
        let preName = nikeNames[socket.id];
        let preNameIndex = nameUsed.indexOf(preName);
        nikeNames[socket.id] = name;
        nameUsed.splice(preNameIndex, 1);
        nameUsed.push(name);
        socket.emit('nameResult', {
          success: true,
          name: name,
        });
        socket.broadcast.to(currentRoom[socket.id]).emit('message', {
          text: `${preName} is now known as ${name}.`,
        });
      } else {
        socket.emit('nameResult', {
          success: false,
          message: 'That name is already in use',
        });
      }
    }
  });
}

function joinRoom(socket, room) {
  socket.join(room);
  currentRoom[socket.id] = room;
  socket.emit('joinResult', { room });
  socket.broadcast.to(room).emit('message', {
    text: `${nikeNames[socket.id] has joined ${room}.}`,
  });
  let usersInRoom = io.socket.clients(room);
  if (usersInRoom.length > 1) {
    let usersInRoomSummary = `Users currently in ${room}: `;
    for(index in usersInRoom) {
      let userSocketId = usersInRoom[index].id;
      if (userSocketId !== socket.id) {
        if (index > 0) {
          usersInRoomSummary += ', ';
        }
        usersInRoomSummary += nikeNames[userSocketId];
      }
    }
    usersInRoomSummary += '.';
    socket.emit('message', {
      text: usersInRoomSummary,
    });
  }
}

function handleMessageBroadcasting(socket) {
  socket.on('message', function(message) {
    socket.broadcast.to(message.room).emit('message', {
      text: `${nikeNames[socket.id]}: ${message.text}`
    });
  });
}

function handleRoomJoining(socket) {
  socket.on('join', function(room) {
    socket.leave(currentRoom[socket.id]);
    joinRoom(socket, room.newRoom);
  });
}

function handleDisconnection(socket) {
  socket.on('disconnect', function(){
    let nameIndex = nameUsed.indexOf(nikeNames[socket.id]);
    nameUsed.splice(nameIndex, 1);
    delete nikeNames[socket.id];
  });
}

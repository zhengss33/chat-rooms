const Chat = function(socket) {
  this.socket = socket;
};

Chat.prototype.sendMessage = function (room, text) {
  let message = {
    room,
    text,
  };

  this.socket.emit('message', message);
};

Chat.prototype.changeRoom = function (room) {
  this.socket.emit('join', {
    newRoom: room,
  });
};

Chat.prototype.processCommand = function (command) {
  let words = command.split(' '),
      command = words[0].substring(1, words[0].length).toLowerCase(),
      message = false;

  switch (command) {
    case 'join':
      words.shift();
      let room = words.join(' ');
      this.changeRoom(room);
      break;

    case 'nick':
      words.shift();
      let name = words.join(' ');
      this.socket.emit('nameAttempt', name);
      break;

    default:
      message = 'Unrecognized command';
      break;
  }
  return message;
}



//

const Chat = function(socket) {
  this.socket = socket;
}

Chat.prototype.sendMessage = function(room, text) {
  this.socket.emit('message', { room, text });
}

Chat.prototype.changeRoom = function(room) {
  this.socket.emit('join', {
    newRoom: room,
  });
}

Chat.prototype.processCommand = function(command) {
  let words = command.split(' ');
  command = words[0]
              .substring(1, words.length)
              .toLowerCase();
  let message = '';
  switch (command) {
    case 'join':
      words.shift();
      let room = words.join(' ');
      this.changeRoom(room);
      break;

    case 'nickname':
      words.shift();
      let name = words.join(' ');
      this.socket.emit('nameAttemp', name);
      break;

    default:
      message = 'Unrecognized command.';
      break;
  }
  return message;
}

const socket = io.connect;

$(document).ready(function() {
  const chatApp = new Chat(socket);

  socket.on('nameResult', (result) => {
    let message;

    if (result.success) {
      messages = `You are now know as ${result.name}.` ;
    } else {
      message = result.message;
    }
    $('#messages').append(divSystemContentElement(message));
  });

  socket.on('joinResult', (result) => {
    $('#room').text(result.room);
    $('#messages').append(divSystemContentElement('room changed.'));
  });

  socket.on('message', (message) => {
    let newElement = $('<div></div>').text(message.text);
    $('#message').append(newElement);
  });

  socket.on('rooms', (rooms) => {
    $('#room-list').empty();

    for (let room in rooms) {
      room = room.substring(1, room.length);
      if (room !== '') {
        $('#room-list').append(divEscapedContentElement(room));
      }
    }

    $('room-list div').click(function() {
      chatApp.processCommand('/join' + $(this).text());
      $('#send-messages').focus();
    });
  });

  setInterval(() => {
    socket.emit('rooms');
  }, 1000);

  $('#send-message').focus();

  $('#send-form').submit(() => {
    processUserInput(chatApp, socket);
    return false;
  });
});

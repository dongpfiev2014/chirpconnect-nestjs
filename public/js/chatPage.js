var typing = false;
var lastTypingTime;

$(document).ready(() => {
  socket.emit('join room', chatId);
  socket.on('typing', () => $('.typingDots').show());
  socket.on('stop typing', () => $('.typingDots').hide());

  $.get(`/chat/api/${chatId}`, (data) => {
    $('#chatName').text(getChatName(data));
  });

  $.get(`/chat/api/${chatId}/messages`, (data) => {
    var messages = [];
    var lastSenderId = '';

    data.forEach((message, index) => {
      var html = createMessageHtml(message, data[index + 1], lastSenderId);
      messages.push(html);

      lastSenderId = message.Sender.UserId;
    });

    var messagesHtml = messages.join('');
    addMessagesHtmlToPage(messagesHtml);
    scrollToBottom(false);
    markAllMessagesAsRead();

    $('.loadingSpinnerContainer').remove();
    $('.chatContainer').css('visibility', 'visible');
  });
});

$('#chatNameButton').click(() => {
  var name = $('#chatNameTextbox').val().trim();
  console.log(name);

  $.ajax({
    url: '/chat/api/' + chatId,
    type: 'PUT',
    data: { chatName: name },
    success: (data, status, xhr) => {
      if (xhr.status != 200) {
        toastr.error('Could not update', 'Alert', {
          closeButton: true,
          progressBar: true,
          positionClass: 'toast-top-right',
          timeOut: '5000',
        });
      } else {
        location.reload();
      }
    },
  });
});

$('.sendMessageButton').click(() => {
  messageSubmitted();
});

$('.inputTextbox').keydown((event) => {
  updateTyping();

  if (event.which === 13) {
    messageSubmitted();
    return false;
  }
});

function updateTyping() {
  if (!connected) return;

  if (!typing) {
    typing = true;
    socket.emit('typing', chatId);
  }

  lastTypingTime = new Date().getTime();
  var timerLength = 3000;

  setTimeout(() => {
    var timeNow = new Date().getTime();
    var timeDiff = timeNow - lastTypingTime;

    if (timeDiff >= timerLength && typing) {
      socket.emit('stop typing', chatId);
      typing = false;
    }
  }, timerLength);
}

function addMessagesHtmlToPage(html) {
  $('.chatMessages').append(html);
}

function messageSubmitted() {
  var content = $('.inputTextbox').val().trim();

  if (content != '') {
    sendMessage(content);
    $('.inputTextbox').val('');
    socket.emit('stop typing', chatId);
    typing = false;
  }
}

function sendMessage(content) {
  $.post(
    '/message/api',
    { content: content, chatId: chatId },
    (data, status, xhr) => {
      console.log(data, xhr);
      if (xhr.status !== 201) {
        toastr.error('Could not send message', 'Alert', {
          closeButton: true,
          progressBar: true,
          positionClass: 'toast-top-right',
          timeOut: '5000',
        });
        $('.inputTextbox').val(content);
        return;
      }

      addChatMessageHtml(data);

      if (connected) {
        socket.emit('new message', data);
      }
    },
  );
}

function addChatMessageHtml(message) {
  if (!message || !message.MessageId) {
    toastr.error('Message is not valid', 'Alert', {
      closeButton: true,
      progressBar: true,
      positionClass: 'toast-top-right',
      timeOut: '5000',
    });
    return;
  }

  var messageDiv = createMessageHtml(message, null, '');

  addMessagesHtmlToPage(messageDiv);
  scrollToBottom(true);
}

function createMessageHtml(message, nextMessage, lastSenderId) {
  var sender = message.Sender;
  var senderName = sender.FirstName + ' ' + sender.LastName;

  var currentSenderId = sender.UserId;
  var nextSenderId = nextMessage != null ? nextMessage.Sender.UserId : '';

  var isFirst = lastSenderId != currentSenderId;
  var isLast = nextSenderId != currentSenderId;

  var isMine = message.Sender.UserId == userLoggedIn.UserId;
  var liClassName = isMine ? 'mine' : 'theirs';

  var nameElement = '';
  if (isFirst) {
    liClassName += ' first';

    if (!isMine) {
      nameElement = `<span class='senderName'>${senderName}</span>`;
    }
  }

  var profileImage = '';
  if (isLast) {
    liClassName += ' last';
    profileImage = `<img src='${sender.ProfilePic}'>`;
  }

  var imageContainer = '';
  if (!isMine) {
    imageContainer = `<div class='imageContainer'>
                                ${profileImage}
                            </div>`;
  }

  return `<li class='message ${liClassName}'>
                ${imageContainer}
                <div class='messageContainer'>
                    ${nameElement}
                    <span class='messageBody'>
                        ${message.Content}
                    </span>
                </div>
            </li>`;
}

function scrollToBottom(animated) {
  var container = $('.chatMessages');
  var scrollHeight = container[0].scrollHeight;

  if (animated) {
    container.animate({ scrollTop: scrollHeight }, 'slow');
  } else {
    container.scrollTop(scrollHeight);
  }
}

function markAllMessagesAsRead() {
  $.ajax({
    url: `/chat/api/${chatId}/messages/markAsRead`,
    type: 'PUT',
    success: () => refreshMessagesBadge(),
  });
}

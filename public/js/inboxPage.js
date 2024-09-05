$(document).ready(() => {
  $.get('/chat/api', (data, status, xhr) => {
    if (xhr.status == 400) {
      toastr.error('Could not get chat list.', 'Alert', {
        closeButton: true,
        progressBar: true,
        positionClass: 'toast-top-right',
        timeOut: '4000',
      });
    } else {
      outputChatList(data, $('.resultsContainer'));
    }
  });
});

function outputChatList(chatList, container) {
  chatList.forEach((chat) => {
    var html = createChatHtml(chat);
    container.append(html);
  });

  if (chatList.length == 0) {
    container.append("<span class='noResults'>Nothing to show.</span>");
  }
}

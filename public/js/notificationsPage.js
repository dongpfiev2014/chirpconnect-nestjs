$(document).ready(() => {
  $.get('/notification/api', (data) => {
    outputNotificationList(data, $('.resultsContainer'));
  });
});

$('#markNotificationsAsRead').click(() => markNotificationsAsOpened());

$(document).ready(() => {
  $.get('/notification/api', (data) => {
    console.log(data);
    outputNotificationList(data, $('.resultsContainer'));
  });
});

$('#markNotificationsAsRead').click(() => markNotificationsAsOpened());

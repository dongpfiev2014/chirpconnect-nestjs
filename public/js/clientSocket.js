// eslint-disable-next-line @typescript-eslint/no-unused-vars
var connected = false;

var socket = io(`${window.location.origin}`);

socket.emit('setup', userLoggedIn);

socket.on('connected', () => (connected = true));

socket.on('message received', (newMessage) => messageReceived(newMessage));

socket.on('notification received', () => {
  $.get('/notification/api/latest', (notificationData) => {
    showNotificationPopup(notificationData);
    refreshNotificationsBadge();
  });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function emitNotification(userId) {
  if (userId == userLoggedIn.UserId) return;

  socket.emit('notification received', userId);
}

var cropper;
var timer;
var selectedUsers = [];

$(document).ready(() => {
  refreshMessagesBadge();
  refreshNotificationsBadge();
});

$('#postTextarea, #replyTextarea').keyup((event) => {
  var textbox = $(event.target);
  var value = textbox.val().trim();

  var isModal = textbox.parents('.modal').length == 1;

  var submitButton = isModal ? $('#submitReplyButton') : $('#submitPostButton');

  if (submitButton.length == 0)
    return toastr.error('No submit button found !!', 'Alert', {
      closeButton: true,
      progressBar: true,
      positionClass: 'toast-top-right',
      timeOut: '5000',
    });

  if (value == '') {
    submitButton.prop('disabled', true);
    return;
  }

  submitButton.prop('disabled', false);
});

$('#submitPostButton, #submitReplyButton').click(() => {
  var button = $(event.target);

  var isModal = button.parents('.modal').length == 1;
  var textbox = isModal ? $('#replyTextarea') : $('#postTextarea');

  var data = {
    Content: textbox.val(),
  };

  if (isModal) {
    var id = button.data().id;
    if (id == null)
      return toastr.error('Button id is null !!', 'Alert', {
        closeButton: true,
        progressBar: true,
        positionClass: 'toast-top-right',
        timeOut: '5000',
      });

    data.ReplyTo = id;
  }

  $.post('/post/api', data, (postData) => {
    if (postData.ReplyTo) {
      location.reload();
    } else {
      var html = createPostHtml(postData);
      $('.postsContainer').prepend(html);
      textbox.val('');
      button.prop('disabled', true);
    }
  });
});

$('#replyModal').on('show.bs.modal', (event) => {
  var button = $(event.relatedTarget);
  var postId = getPostIdFromElement(button);
  $('#submitReplyButton').data('id', postId);

  $.get('/post/api/' + postId, (results) => {
    outputPosts(results, $('#originalPostContainer'));
  });
});

$('#replyModal').on('hidden.bs.modal', () =>
  $('#originalPostContainer').html(''),
);

$('#deletePostModal').on('show.bs.modal', (event) => {
  console.log(event);
  var button = $(event.relatedTarget);
  var postId = getPostIdFromElement(button);
  $('#deletePostButton').data('id', postId);
});

$('#confirmPinModal').on('show.bs.modal', (event) => {
  var button = $(event.relatedTarget);
  var postId = getPostIdFromElement(button);
  $('#pinPostButton').data('id', postId);
});

$('#unpinModal').on('show.bs.modal', (event) => {
  var button = $(event.relatedTarget);
  var postId = getPostIdFromElement(button);
  $('#unpinPostButton').data('id', postId);
});

$('#deletePostButton').click((event) => {
  var postId = $(event.target).data('id');

  $.ajax({
    url: `/post/api/${postId}`,
    type: 'DELETE',
    success: (data, status, xhr) => {
      if (xhr.responseJSON.errorMessage) {
        toastr.error('Could not delete post !!', 'Alert', {
          closeButton: true,
          progressBar: true,
          positionClass: 'toast-top-right',
          timeOut: '5000',
        });
        return;
      }
      toastr.success('Post deleted successfully', 'Success', {
        closeButton: true,
        progressBar: true,
        positionClass: 'toast-top-right',
        timeOut: '1000',
      });
      setTimeout(() => {
        location.reload();
      }, 1000);
    },
  });
});

$('#pinPostButton').click((event) => {
  var postId = $(event.target).data('id');
  console.log(postId);

  $.ajax({
    url: `/post/api/${postId}`,
    type: 'PUT',
    data: { Pinned: true },
    success: (data, status, xhr) => {
      if (xhr.responseJSON.errorMessage) {
        toastr.error('Could not pin post !!', 'Alert', {
          closeButton: true,
          progressBar: true,
          positionClass: 'toast-top-right',
          timeOut: '5000',
        });
        return;
      }

      location.reload();
    },
  });
});

$('#unpinPostButton').click((event) => {
  var postId = $(event.target).data('id');
  console.log(postId);

  $.ajax({
    url: `/post/api/${postId}`,
    type: 'PUT',
    data: { Pinned: false },
    success: (data, status, xhr) => {
      if (xhr.responseJSON.errorMessage) {
        toastr.error('Could not unpin post !!', 'Alert', {
          closeButton: true,
          progressBar: true,
          positionClass: 'toast-top-right',
          timeOut: '5000',
        });
        return;
      }

      location.reload();
    },
  });
});

$('#filePhoto').change(function () {
  if (this.files && this.files[0]) {
    var reader = new FileReader();
    reader.onload = (e) => {
      var image = document.getElementById('imagePreview');
      image.src = e.target.result;

      if (cropper !== undefined) {
        cropper.destroy();
      }

      cropper = new Cropper(image, {
        aspectRatio: 1 / 1,
        background: false,
      });
    };
    reader.readAsDataURL(this.files[0]);
  } else {
    console.log('nope');
  }
});

$('#coverPhoto').change(function () {
  if (this.files && this.files[0]) {
    var reader = new FileReader();
    reader.onload = (e) => {
      var image = document.getElementById('coverPreview');
      image.src = e.target.result;

      if (cropper !== undefined) {
        cropper.destroy();
      }

      cropper = new Cropper(image, {
        aspectRatio: 16 / 9,
        background: false,
      });
    };
    reader.readAsDataURL(this.files[0]);
  }
});

$('#imageUploadButton').click(() => {
  var canvas = cropper.getCroppedCanvas();

  if (canvas == null) {
    toastr.error(
      'Could not upload image. Make sure it is an image file.',
      'Alert',
      {
        closeButton: true,
        progressBar: true,
        positionClass: 'toast-top-right',
        timeOut: '4000',
      },
    );
    return;
  }
  toastr.info(
    'Image loading in progress. Thank you for your patience.',
    'Loading',
    {
      closeButton: true,
      progressBar: true,
      positionClass: 'toast-top-right',
      timeOut: '4000',
    },
  );

  canvas.toBlob((blob) => {
    var formData = new FormData();
    formData.append('file', blob);

    $.ajax({
      url: '/user/api/profilePicture',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: () => location.reload(),
      error: () => {
        toastr.error(
          'Make sure it is an image file and not exceed 10mb',
          'Alert',
          {
            closeButton: true,
            progressBar: true,
            positionClass: 'toast-top-right',
            timeOut: '4000',
          },
        );
      },
    });
  }, 'image/jpeg');
});

$('#coverPhotoButton').click(() => {
  var canvas = cropper.getCroppedCanvas();

  if (canvas == null) {
    toastr.error(
      'Could not upload image. Make sure it is an image file.',
      'Alert',
      {
        closeButton: true,
        progressBar: true,
        positionClass: 'toast-top-right',
        timeOut: '4000',
      },
    );
    return;
  }
  toastr.info(
    'Image loading in progress. Thank you for your patience.',
    'Loading',
    {
      closeButton: true,
      progressBar: true,
      positionClass: 'toast-top-right',
      timeOut: '4000',
    },
  );

  canvas.toBlob((blob) => {
    var formData = new FormData();
    formData.append('file', blob);

    $.ajax({
      url: '/user/api/coverPhoto',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: () => location.reload(),
      error: (x) => {
        console.log(x);
        toastr.error(
          'Make sure it is an image file and not exceed 10mb',
          'Alert',
          {
            closeButton: true,
            progressBar: true,
            positionClass: 'toast-top-right',
            timeOut: '4000',
          },
        );
      },
    });
  }, 'image/jpeg');
});

$('#userSearchTextbox').keydown((event) => {
  clearTimeout(timer);
  var textbox = $(event.target);
  var value = textbox.val();

  if (value == '' && (event.which == 8 || event.keyCode == 8)) {
    // remove user from selection
    selectedUsers.pop();
    updateSelectedUsersHtml();
    $('.resultsContainer').html('');

    if (selectedUsers.length == 0) {
      $('#createChatButton').prop('disabled', true);
    }

    return;
  }

  timer = setTimeout(() => {
    value = textbox.val().trim();

    if (value == '') {
      $('.resultsContainer').html('');
    } else {
      searchUsers(value);
    }
  }, 500);
});

$('#createChatButton').click(() => {
  var data = JSON.stringify(selectedUsers);

  $.post('/chat/api', { users: data }, (chat) => {
    if (!chat || !chat.ChatId)
      return toastr.error('Invalid response from server.', 'Alert', {
        closeButton: true,
        progressBar: true,
        positionClass: 'toast-top-right',
        timeOut: '4000',
      });

    window.location.href = `/message/${chat.ChatId}`;
  });
});

$(document).on('click', '.likeButton', (event) => {
  var button = $(event.target);
  var postId = getPostIdFromElement(button);

  if (postId === undefined) return;

  $.ajax({
    url: `/post/api/${postId}/like`,
    type: 'PUT',
    success: (postData) => {
      button.find('span').text(postData.LikedBy.length || '');
      if (
        postData.LikedBy.some((user) => user.UserId === userLoggedIn.UserId)
      ) {
        button.addClass('active');
      } else {
        button.removeClass('active');
      }
    },
  });
});

$(document).on('click', '.retweetButton', (event) => {
  var button = $(event.target);
  var postId = getPostIdFromElement(button);

  if (postId === undefined) return;

  $.ajax({
    url: `/post/api/${postId}/retweet`,
    type: 'POST',
    success: (postData) => {
      button.find('span').text(postData.RetweetUsers.length || '');

      if (
        postData.RetweetUsers.some(
          (user) => user.UserId === userLoggedIn.UserId,
        )
      ) {
        button.addClass('active');
      } else {
        button.removeClass('active');
      }
    },
  });
});

$(document).on('click', '.post', (event) => {
  var element = $(event.target);
  var postId = getPostIdFromElement(element);

  if (postId !== undefined && !element.is('button')) {
    window.location.href = '/post/' + postId;
  }
});

$(document).on('click', '.followButton', (e) => {
  var button = $(e.target);
  var userId = button.data().user;

  $.ajax({
    url: `/user/api/${userId}/follow`,
    type: 'PUT',
    success: (data, status, xhr) => {
      console.log(data);
      if (xhr.status !== 200) {
        toastr.error('User not found !!', 'Alert', {
          closeButton: true,
          progressBar: true,
          positionClass: 'toast-top-right',
          timeOut: '5000',
        });
        return;
      }

      var difference = 1;
      if (
        data.Following.length > 0 &&
        data.Following.some((follower) => follower.UserId === userId)
      ) {
        button.addClass('following');
        button.text('Following');
      } else {
        button.removeClass('following');
        button.text('Follow');
        difference = -1;
      }

      var followersLabel = $('#followersValue');
      if (followersLabel.length != 0) {
        var followersText = followersLabel.text();
        followersText = parseInt(followersText);
        followersLabel.text(followersText + difference);
      }
    },
  });
});

$(document).on('click', '.notification.active', (e) => {
  var container = $(e.target);
  var notificationId = container.data().id;

  var href = container.attr('href');
  e.preventDefault();

  var callback = () => (window.location = href);
  markNotificationsAsOpened(notificationId, callback);
});

function getPostIdFromElement(element) {
  var isRoot = element.hasClass('post');
  var rootElement = isRoot == true ? element : element.closest('.post');
  var postId = rootElement.data().id;

  if (postId === undefined)
    return toastr.error('Post id undefined !!', 'Alert', {
      closeButton: true,
      progressBar: true,
      positionClass: 'toast-top-right',
      timeOut: '5000',
    });

  return postId;
}

function createPostHtml(postData, largeFont = false) {
  if (postData == null)
    return toastr.error('Post object is null !!', 'Alert', {
      closeButton: true,
      progressBar: true,
      positionClass: 'toast-top-right',
      timeOut: '5000',
    });

  var isRetweet = postData.OriginalPost !== null;
  var retweetedBy = isRetweet ? postData.PostedBy.Username : null;

  postData = isRetweet ? postData.OriginalPost : postData;

  var postedBy = postData.PostedBy;

  if (postedBy?.UserId === undefined) {
    return console.log('User object not populated');
  }

  var displayName = postedBy.FirstName + ' ' + postedBy.LastName;

  var timezoneOffsetInHours = getTimezoneOffsetInHours();
  var localCreatedAt = addHoursToUTC(postData.CreatedAt, timezoneOffsetInHours);
  var timestamp = timeDifference(new Date(), new Date(localCreatedAt));

  var likeButtonActiveClass = postData.LikedBy.some(
    (user) => user.UserId === userLoggedIn.UserId,
  )
    ? 'active'
    : '';
  var retweetButtonActiveClass = postData.RetweetUsers.some(
    (user) => user.UserId === userLoggedIn.UserId,
  )
    ? 'active'
    : '';
  var largeFontClass = largeFont ? 'largeFont' : '';

  var retweetText = '';
  if (isRetweet) {
    retweetText = `<span>
                      <i class='fas fa-retweet'></i>
                      Retweeted by <a href='/profile/${retweetedBy}'>@${retweetedBy}</a>    
                  </span>`;
  }

  var replyFlag = '';
  if (postData.ReplyTo) {
    if (!postData.ReplyTo.PostId) {
      return alert('Reply to is not populated');
    } else if (!postData.ReplyTo.PostedBy.UserId) {
      return alert('Posted by is not populated');
    }

    var replyToUsername = postData.ReplyTo.PostedBy.Username;
    replyFlag = `<div class='replyFlag'>
                        Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}<a>
                    </div>`;
  }

  var buttons = '';
  var pinnedPostText = '';
  if (postData.PostedBy.UserId == userLoggedIn.UserId) {
    var pinnedClass = '';
    var dataTarget = '#confirmPinModal';
    if (postData.Pinned === true) {
      pinnedClass = 'active';
      dataTarget = '#unpinModal';
      pinnedPostText =
        "<i class='fas fa-thumbtack'></i> <span>Pinned post</span>";
    }
    buttons = `<button class='pinButton ${pinnedClass}' data-id="${postData.PostId}" data-toggle="modal" data-target="${dataTarget}"><i class='fas fa-thumbtack'></i></button>
    <button data-id="${postData.PostId}" data-toggle="modal" data-target="#deletePostModal"><i class='fas fa-times'></i></button>`;
  }

  return `<div class='post ${largeFontClass}' data-id='${postData.PostId}'>
              <div class='postActionContainer'>
                  ${retweetText}
              </div>
              <div class='mainContentContainer'>
                  <div class='userImageContainer'>
                      <img src='${postedBy.ProfilePic}'>
                  </div>
                  <div class='postContentContainer'>
                      <div class='pinnedPostText'>${pinnedPostText}</div>
                      <div class='header'>
                        <div>
                          <a href='/profile/${postedBy.Username}' class='displayName'>${displayName}</a>
                          <span class='username'>@${postedBy.Username}</span>
                          <span class='date'>${timestamp}</span>
                        </div>
                        <div>
                          ${buttons}
                        </div>
                      </div>
                      ${replyFlag}
                      <div class='postBody'>
                          <span>${postData.Content}</span>
                      </div>
                      <div class='postFooter'>
                          <div class='postButtonContainer'>
                              <button data-toggle='modal' data-target='#replyModal'>
                                <i class='far fa-comment'></i>
                              </button>
                          </div>
                          <div class='postButtonContainer green'>
                              <button class='retweetButton ${retweetButtonActiveClass}'>
                                  <i class='fas fa-retweet'></i>
                                  <span>${postData.RetweetUsers.length || ''}</span>
                              </button>
                          </div>
                          <div class='postButtonContainer red'>
                              <button class='likeButton ${likeButtonActiveClass}'>
                                  <i class='far fa-heart'></i>
                                  <span>${postData.LikedBy.length || ''}</span>
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>`;
}

function getTimezoneOffsetInHours() {
  var offset = new Date().getTimezoneOffset();
  return -offset / 60;
}

function addHoursToUTC(utcDateString, hours) {
  var date = new Date(utcDateString);
  date.setHours(date.getHours() + hours);
  return date;
}

function timeDifference(current, previous) {
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    if (elapsed / 1000 < 30) return 'Just now';

    return Math.round(elapsed / 1000) + ' seconds ago';
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + ' minutes ago';
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + ' hours ago';
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + ' days ago';
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + ' months ago';
  } else {
    return Math.round(elapsed / msPerYear) + ' years ago';
  }
}

function outputPosts(results, container) {
  container.html('');

  if (!Array.isArray(results)) {
    results = [results];
  }

  results.forEach((result) => {
    var html = createPostHtml(result);
    container.append(html);
  });

  if (results.length == 0) {
    container.append("<span class='noResults'>Nothing to show.</span>");
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function outputPostsWithReplies(results, container) {
  container.html('');
  if (results.ReplyTo !== null && results.ReplyTo.PostId !== undefined) {
    var html = createPostHtml(results.ReplyTo);
    container.append(html);
  }

  var mainPostHtml = createPostHtml(results, true);
  container.append(mainPostHtml);

  results.Replies.forEach((result) => {
    var html = createPostHtml(result);
    container.append(html);
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function outputUsers(results, container) {
  console.log(results);
  container.html('');

  results.forEach((result) => {
    var html = createUserHtml(result, true);
    container.append(html);
  });

  if (results.length == 0) {
    container.append("<span class='noResults'>No results found</span>");
  }
}

function createUserHtml(userData, showFollowButton) {
  var name = userData.FirstName + ' ' + userData.LastName;
  var isFollowing =
    userLoggedIn.Following &&
    userLoggedIn.Following.some(
      (follower) => follower.UserId === userData.UserId,
    );
  var text = isFollowing ? 'Following' : 'Follow';
  var buttonClass = isFollowing ? 'followButton following' : 'followButton';

  var followButton = '';
  if (showFollowButton && userLoggedIn.UserId != userData.UserId) {
    followButton = `<div class='followButtonContainer'>
                          <button class='${buttonClass}' data-user='${userData.UserId}'>${text}</button>
                      </div>`;
  }

  return `<div class='user'>
              <div class='userImageContainer'>
                  <img src='${userData.ProfilePic}'>
              </div>
              <div class='userDetailsContainer'>
                  <div class='header'>
                      <a href='/profile/${userData.Username}'>${name}</a>
                      <span class='username'>@${userData.Username}</span>
                  </div>
              </div>
              ${followButton}
          </div>`;
}

function searchUsers(searchTerm) {
  $.get('/user/api', { search: searchTerm }, (results) => {
    outputSelectableUsers(results, $('.resultsContainer'));
  });
}

function outputSelectableUsers(results, container) {
  container.html('');
  console.log(results);
  results.forEach((result) => {
    if (
      result.UserId == userLoggedIn.UserId ||
      selectedUsers.some((u) => u.UserId == result.UserId)
    ) {
      return;
    }

    var html = createUserHtml(result, false);
    var element = $(html);
    element.click(() => userSelected(result));

    container.append(element);
  });

  if (results.length == 0) {
    container.append("<span class='noResults'>No results found</span>");
  }
}

function userSelected(user) {
  selectedUsers.push(user);
  updateSelectedUsersHtml();
  $('#userSearchTextbox').val('').focus();
  $('.resultsContainer').html('');
  $('#createChatButton').prop('disabled', false);
}

function updateSelectedUsersHtml() {
  var elements = [];

  selectedUsers.forEach((user) => {
    var name = user.FirstName + ' ' + user.LastName;
    var userElement = $(`<span class='selectedUser'>${name}</span>`);
    elements.push(userElement);
  });

  $('.selectedUser').remove();
  $('#selectedUsers').prepend(elements);
}

function getChatName(chatData) {
  var chatName = chatData.chatName;

  if (!chatName) {
    var otherChatUsers = getOtherChatUsers(chatData.users);
    var namesArray = otherChatUsers.map(
      (user) => user.FirstName + ' ' + user.LastName,
    );
    chatName = namesArray.join(', ');
  }

  return chatName;
}

function getOtherChatUsers(users) {
  if (users.length == 1) return users;

  return users.filter((user) => user.UserId != userLoggedIn.UserId);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function messageReceived(newMessage) {
  if ($(`[data-room="${newMessage.chat._id}"]`).length == 0) {
    // Show popup notification
    showMessagePopup(newMessage);
  } else {
    addChatMessageHtml(newMessage);
  }

  refreshMessagesBadge();
}

function markNotificationsAsOpened(notificationId = null, callback = null) {
  if (callback == null) callback = () => location.reload();

  var url =
    notificationId != null
      ? `/api/notifications/${notificationId}/markAsOpened`
      : `/api/notifications/markAsOpened`;
  $.ajax({
    url: url,
    type: 'PUT',
    success: () => callback(),
  });
}

function refreshMessagesBadge() {
  $.get('/api/chats', { unreadOnly: true }, (data) => {
    var numResults = data.length;

    if (numResults > 0) {
      $('#messagesBadge').text(numResults).addClass('active');
    } else {
      $('#messagesBadge').text('').removeClass('active');
    }
  });
}

function refreshNotificationsBadge() {
  $.get('/api/notifications', { unreadOnly: true }, (data) => {
    var numResults = data.length;

    if (numResults > 0) {
      $('#notificationBadge').text(numResults).addClass('active');
    } else {
      $('#notificationBadge').text('').removeClass('active');
    }
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function showNotificationPopup(data) {
  var html = createNotificationHtml(data);
  var element = $(html);
  element.hide().prependTo('#notificationList').slideDown('fast');

  setTimeout(() => element.fadeOut(400), 5000);
}

function showMessagePopup(data) {
  if (!data.chat.latestMessage._id) {
    data.chat.latestMessage = data;
  }

  var html = createChatHtml(data.chat);
  var element = $(html);
  element.hide().prependTo('#notificationList').slideDown('fast');

  setTimeout(() => element.fadeOut(400), 5000);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function outputNotificationList(notifications, container) {
  notifications.forEach((notification) => {
    var html = createNotificationHtml(notification);
    container.append(html);
  });

  if (notifications.length == 0) {
    container.append("<span class='noResults'>Nothing to show.</span>");
  }
}

function createNotificationHtml(notification) {
  var userFrom = notification.userFrom;
  var text = getNotificationText(notification);
  var href = getNotificationUrl(notification);
  var className = notification.opened ? '' : 'active';

  return `<a href='${href}' class='resultListItem notification ${className}' data-id='${notification._id}'>
              <div class='resultsImageContainer'>
                  <img src='${userFrom.ProfilePic}'>
              </div>
              <div class='resultsDetailsContainer ellipsis'>
                  <span class='ellipsis'>${text}</span>
              </div>
          </a>`;
}

function getNotificationText(notification) {
  var userFrom = notification.userFrom;

  if (!userFrom.FirstName || !userFrom.LastName) {
    return alert('user from data not populated');
  }

  var userFromName = `${userFrom.FirstName} ${userFrom.LastName}`;

  var text;

  if (notification.notificationType == 'retweet') {
    text = `${userFromName} retweeted one of your posts`;
  } else if (notification.notificationType == 'postLike') {
    text = `${userFromName} liked one of your posts`;
  } else if (notification.notificationType == 'reply') {
    text = `${userFromName} replied to one of your posts`;
  } else if (notification.notificationType == 'follow') {
    text = `${userFromName} followed you`;
  }

  return `<span class='ellipsis'>${text}</span>`;
}

function getNotificationUrl(notification) {
  var url = '#';

  if (
    notification.notificationType == 'retweet' ||
    notification.notificationType == 'postLike' ||
    notification.notificationType == 'reply'
  ) {
    url = `/posts/${notification.entityId}`;
  } else if (notification.notificationType == 'follow') {
    url = `/profile/${notification.entityId}`;
  }

  return url;
}

function createChatHtml(chatData) {
  var chatName = getChatName(chatData);
  var image = getChatImageElements(chatData);
  var latestMessage = getLatestMessage(chatData.latestMessage);

  var activeClass =
    !chatData.latestMessage ||
    chatData.latestMessage.readBy.includes(userLoggedIn.UserId)
      ? ''
      : 'active';

  return `<a href='/messages/${chatData._id}' class='resultListItem ${activeClass}'>
              ${image}
              <div class='resultsDetailsContainer ellipsis'>
                  <span class='heading ellipsis'>${chatName}</span>
                  <span class='subText ellipsis'>${latestMessage}</span>
              </div>
          </a>`;
}

function getLatestMessage(latestMessage) {
  if (latestMessage != null) {
    var sender = latestMessage.sender;
    return `${sender.FirstName} ${sender.LastName}: ${latestMessage.content}`;
  }

  return 'New chat';
}

function getChatImageElements(chatData) {
  var otherChatUsers = getOtherChatUsers(chatData.users);

  var groupChatClass = '';
  var chatImage = getUserChatImageElement(otherChatUsers[0]);

  if (otherChatUsers.length > 1) {
    groupChatClass = 'groupChatImage';
    chatImage += getUserChatImageElement(otherChatUsers[1]);
  }

  return `<div class='resultsImageContainer ${groupChatClass}'>${chatImage}</div>`;
}

function getUserChatImageElement(user) {
  if (!user || !user.ProfilePic) {
    return alert('User passed into function is invalid');
  }

  return `<img src='${user.ProfilePic}' alt='User's profile pic'>`;
}

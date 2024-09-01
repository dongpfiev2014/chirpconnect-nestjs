$('#postTextarea, #replyTextarea').keyup((event) => {
  var textbox = $(event.target);
  var value = textbox.val().trim();

  var isModal = textbox.parents('.modal').length == 1;

  var submitButton = isModal ? $('#submitReplyButton') : $('#submitPostButton');

  if (submitButton.length == 0) return alert('No submit button found');

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
    if (id == null) return alert('Button id is null');
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

$('#deletePostButton').click((event) => {
  console.log(event);
  var postId = $(event.target).data('id');

  $.ajax({
    url: `/post/api/${postId}`,
    type: 'DELETE',
    success: (data, status, xhr) => {
      console.log(xhr);
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
        postData.LikedBy?.some((user) => user.UserId === userLoggedIn.UserId)
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
      button.find('span').text(postData.RetweetUsers?.length || '');

      if (
        postData.RetweetUsers?.some(
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

function getPostIdFromElement(element) {
  var isRoot = element.hasClass('post');
  var rootElement = isRoot == true ? element : element.closest('.post');
  var postId = rootElement.data().id;

  if (postId === undefined) return alert('Post id undefined');

  return postId;
}

function createPostHtml(postData, largeFont = false) {
  if (postData == null) return alert('post object is null');

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

  var likeButtonActiveClass = postData.LikedBy?.some(
    (user) => user.UserId === userLoggedIn.UserId,
  )
    ? 'active'
    : '';

  var retweetButtonActiveClass = postData.RetweetUsers?.some(
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
  if (postData.PostedBy.UserId == userLoggedIn.UserId) {
    buttons = `<button data-id='${postData.PostId}' data-toggle='modal' data-target='#deletePostModal'><i class='fas fa-times'></i></button>`;
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
                      <div class='header'>
                        <div>
                          <a href='/profile/${postedBy.Username}' class='displayName'>${displayName}</a>
                          <span class='username'>@${postedBy.Username}</span>
                          <span class='date'>${timestamp}</span>
                        </div>
                        ${buttons}
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
                                  <span>${postData.RetweetUsers?.length || ''}</span>
                              </button>
                          </div>
                          <div class='postButtonContainer red'>
                              <button class='likeButton ${likeButtonActiveClass}'>
                                  <i class='far fa-heart'></i>
                                  <span>${postData.LikedBy?.length || ''}</span>
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
  console.log(results);
  container.html('');
  console.log(results);
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

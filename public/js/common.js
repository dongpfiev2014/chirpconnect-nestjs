$('#postTextarea').keyup((event) => {
  var textbox = $(event.target);
  var value = textbox.val().trim();

  var submitButton = $('#submitPostButton');

  if (submitButton.length == 0) return alert('No submit button found');

  if (value == '') {
    submitButton.prop('disabled', true);
    return;
  }

  submitButton.prop('disabled', false);
});

$('#submitPostButton').click(() => {
  var button = $(event.target);
  var textbox = $('#postTextarea');

  var data = {
    Content: textbox.val(),
  };

  $.post('/post/api', data, (postData) => {
    console.log(postData);
    var html = createPostHtml(postData);
    $('.postsContainer').prepend(html);
    textbox.val('');
    button.prop('disabled', true);
  });
});

function createPostHtml(postData) {
  var postedBy = postData.PostedBy;

  if (postedBy.UserId === undefined) {
    return console.log('User object not populated');
  }

  var displayName = postedBy.FirstName + ' ' + postedBy.LastName;

  var timezoneOffsetInHours = getTimezoneOffsetInHours();
  var localCreatedAt = addHoursToUTC(
    postData.CreatedAt,
    timezoneOffsetInHours,
  ).toISOString();
  var timestamp = timeDifference(new Date(), new Date(localCreatedAt));

  return `<div class='post'>
              <div class='mainContentContainer'>
                  <div class='userImageContainer'>
                      <img src='${postedBy.ProfilePic}'>
                  </div>
                  <div class='postContentContainer'>
                      <div class='header'>
                          <a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>
                          <span class='username'>@${postedBy.Username}</span>
                          <span class='date'>${timestamp}</span>
                      </div>
                      <div class='postBody'>
                          <span>${postData.Content}</span>
                      </div>
                      <div class='postFooter'>
                          <div class='postButtonContainer'>
                              <button>
                                  <i class='far fa-comment'></i>
                              </button>
                          </div>
                          <div class='postButtonContainer'>
                              <button>
                                  <i class='fas fa-retweet'></i>
                              </button>
                          </div>
                          <div class='postButtonContainer'>
                              <button>
                                  <i class='far fa-heart'></i>
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

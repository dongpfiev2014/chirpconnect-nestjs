$(document).ready(() => {
  if (selectedTab === 'replies') {
    loadReplies();
  } else {
    loadPosts();
  }
});

function loadPosts() {
  $.get('/post/api', { postedBy: profileUserId, isReply: false }, (results) => {
    outputPosts(results, $('.postsContainer'));
  });
}

function loadReplies() {
  $.get('/post/api', { postedBy: profileUserId, isReply: true }, (results) => {
    outputPosts(results, $('.postsContainer'));
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function outputPinnedPost(results, container) {
  if (results.length == 0) {
    container.hide();
    return;
  }

  container.html('');

  results.forEach((result) => {
    var html = createPostHtml(result);
    container.append(html);
  });
}

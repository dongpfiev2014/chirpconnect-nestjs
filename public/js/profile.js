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

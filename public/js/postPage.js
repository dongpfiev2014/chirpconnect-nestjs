$(document).ready(() => {
  $.get('/post/api/' + postId, (results) => {
    outputPostsWithReplies(results, $('.postsContainer'));
  });
});

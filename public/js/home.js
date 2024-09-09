$(document).ready(() => {
  $.get('/post/api', { followingOnly: true }, (results) => {
    outputPosts(results, $('.postsContainer'));
  });
});

$(document).ready(() => {
  $.get('/post/api', { followingOnly: true }, (results) => {
    console.log(results);
    outputPosts(results, $('.postsContainer'));
  });
});

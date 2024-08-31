$(document).ready(() => {
  $.get('/post/api', (results) => {
    console.log(results);
    outputPosts(results, $('.postsContainer'));
  });
});

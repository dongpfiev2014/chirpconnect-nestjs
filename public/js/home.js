$(document).ready(() => {
  $.get('/post/api', (results) => {
    console.log(results);
    outputPosts(results, $('.postsContainer'));
  });
});

function outputPosts(results, container) {
  container.html('');

  results.forEach((result) => {
    var html = createPostHtml(result);
    container.append(html);
  });

  if (results.length == 0) {
    container.append("<span class='noResults'>Nothing to show.</span>");
  }
}

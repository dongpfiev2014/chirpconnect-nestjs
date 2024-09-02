$(document).ready(() => {
  if (selectedTab === 'followers') {
    loadFollowers();
  } else {
    loadFollowing();
  }
});

function loadFollowers() {
  $.get(`/user/api/${profileUserId}/followers`, (results) => {
    outputUsers(results.Followers, $('.resultsContainer'));
  });
}

function loadFollowing() {
  $.get(`/user/api/${profileUserId}/following`, (results) => {
    outputUsers(results.Following, $('.resultsContainer'));
  });
}

window.onload = (event) => {
  // Unbind click event to prevent multiple bindings
  $('#cpubtn').unbind('click');

  // Generate a random code
  let code = (Math.random() + 1).toString(36).substring(7);
  $('#code').val(code);

  // Check if the code matches the expected pattern
  if (/^\w{5,12}$/.test(code)) {
    // Request status of the currently typed lobby
    send({
      'cmd': 'status',
      'lobby': code
    });

    // Check if the user has played the game 3 times already
    let playedCount = getPlayedCount(code);

    if (playedCount >= 3) {
      // Disable the button if the user has played 3 times
      $('#cpubtn').prop('disabled', true);
    } else {
      // Enable the button if the user can still play
      $('#cpubtn').prop('disabled', false);

      // Increment the played count
      setPlayedCount(code, playedCount + 1);
    }
  }
};

// Function to get the played count for a given lobby code
function getPlayedCount(lobbyCode) {
  // Use localStorage to store played count
  let playedCount = localStorage.getItem(lobbyCode) || 0;
  return parseInt(playedCount, 10);
}

// Function to set the played count for a given lobby code
function setPlayedCount(lobbyCode, count) {
  // Use localStorage to store played count
  localStorage.setItem(lobbyCode, count);
}

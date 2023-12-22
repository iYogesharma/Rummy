// Function to fetch the user's balance and update the DOM
function fetchBalance() {
  fetch("http://localhost:8000/v1/balance/")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      console.log(response.status);
      console.log(response.ok);
      return response.json();
    })
    .then((data) => {
      console.log(data);
      // Update the DOM with the fetched balance
      document.getElementById(
        "balance-container"
      ).innerText = `${data.data.balance}`;
      document.getElementById(
        "currency-container"
      ).innerText = `Available ${data.data.currency} Balance`;

      // Call the function to update the lobby button and show alert
      updateLobbyButtonVisibility(data.data.balance);
    })
    .catch((error) => {
      console.error("Error during fetch:", error);
    });
}

// Function to update the lobby button and show alert if balance is insufficient
function updateLobbyButtonVisibility(balance) {
  var lobbyButton = document.getElementById("lobbybtn");

  // Check if the balance is less than 10.
  if (balance < 10) {
    lobbyButton.disabled = true; // Disable the button.
    alert(
      "Insufficient balance to play the game. Please recharge your account."
    );
  } else {
    lobbyButton.disabled = false; // Enable the button.
  }
}

// Call the fetchBalance function when the page loads
document.addEventListener("DOMContentLoaded", fetchBalance);

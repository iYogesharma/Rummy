// Function to fetch the user's balance and update the DOM
function fetchBalance() {
  fetch("/v1/balance/")
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
      document.getElementById("balance-container").innerText = `${data.data.balance}`;
      document.getElementById("currency-container").innerText = `Available ${data.data.currency} Balance`;

      // Call the function to update the UI based on balance
      updateUI(data.data.balance);
    })
    .catch((error) => {
      console.error("Error during fetch:", error);
    });
}

// Function to update the UI based on balance
function updateUI(balance) {
  var lobbyButton = document.getElementById("lobbybtn");
  var inputField = document.getElementById("yourInputField"); // Replace with the actual ID of your input field
  var errorContainer = document.getElementById("error-message");

  // Check if the balance is less than 10.
  if (balance < 10) {
    lobbyButton.disabled = true; // Disable the button.

    // Show error message below the input field
    if (!errorContainer) {
      errorContainer = document.createElement("div");
      errorContainer.id = "error-message";
      errorContainer.style.color = "red";
      inputField.parentNode.insertBefore(errorContainer, inputField.nextSibling);
    }
    errorContainer.innerText = "Insufficient balance to play the game. Please recharge your account.";
  } else {
    lobbyButton.disabled = false; // Enable the button.

    // Remove the error message
    if (errorContainer) {
      errorContainer.parentNode.removeChild(errorContainer);
    }
  }
}

// Call the fetchBalance function when the page loads
document.addEventListener("DOMContentLoaded", fetchBalance);

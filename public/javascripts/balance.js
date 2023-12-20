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
      ).innerText = `Balance: ${data.data.balance}`;
      document.getElementById(
        "currency-container"
      ).innerText = `Currency: ${data.data.currency}`;
    })
    .catch((error) => {
      console.error("Error during fetch:", error);
    });
}

// Call the fetchBalance function when the page loads
document.addEventListener("DOMContentLoaded", fetchBalance);

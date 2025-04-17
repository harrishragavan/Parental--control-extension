const API_URL = "http://localhost:5000"; // Replace with your backend URL

document.getElementById("login").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (response.ok) {
      chrome.storage.sync.set({ token: data.token }, () => {
        window.location.href = "popup.html"; // Redirect to popup
      });
    } else {
      document.getElementById("message").textContent = data.message;
    }
  } catch (err) {
    document.getElementById("message").textContent = "Server error";
  }
});

document.getElementById("register").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (response.ok) {
      document.getElementById("message").textContent = "Registration successful! Please log in.";
    } else {
      document.getElementById("message").textContent = data.message;
    }
  } catch (err) {
    document.getElementById("message").textContent = "Server error";
  }
});
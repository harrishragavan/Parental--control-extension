const siteInput = document.getElementById("siteInput");
const addSiteButton = document.getElementById("addSite");
const blockedSitesList = document.getElementById("blockedSites");
const logoutButton = document.getElementById("logoutButton");

// Redirect to login if the user is not logged in
chrome.storage.sync.get("token", (data) => {
  if (!data.token) {
    window.location.href = "login.html"; // Redirect to login if not logged in
  }
});

// Load blocked sites and display them
chrome.storage.sync.get("blockedSites", (data) => {
  const blockedSites = data.blockedSites || [];
  if (blockedSites.length === 0) {
    document.getElementById("emptyMessage").style.display = "block";
  } else {
    document.getElementById("emptyMessage").style.display = "none";
    blockedSites.forEach((site) => addSiteToList(site));
  }
});

// Add a site to the blocked list
addSiteButton.addEventListener("click", () => {
  const site = siteInput.value.trim();
  if (!site) {
    alert("Please enter a valid website.");
    return;
  }

  chrome.storage.sync.get("blockedSites", (data) => {
    const blockedSites = data.blockedSites || [];
    if (!blockedSites.includes(site)) {
      blockedSites.push(site);
      chrome.storage.sync.set({ blockedSites }, () => {
        addSiteToList(site);
        siteInput.value = "";
        document.getElementById("emptyMessage").style.display = "none";
      });
    } else {
      alert("This website is already blocked.");
    }
  });
});

// Add a site to the UI list
function addSiteToList(site) {
  const li = document.createElement("li");
  li.textContent = site;

  const removeButton = document.createElement("button");
  removeButton.textContent = "Remove";
  removeButton.classList.add("remove-site");
  removeButton.dataset.site = site;

  li.appendChild(removeButton);
  blockedSitesList.appendChild(li);
}

// Function to remove a site
// Function to remove a site
function removeSite(site) {
  const password = prompt("Enter your password to remove this site:");
  if (!password) {
    alert("Password is required to remove the site.");
    return;
  }

  // Send the password and site to the backend for verification
  chrome.storage.sync.get("token", async (data) => {
    const token = data.token;

    if (!token) {
      alert("You are not logged in. Please log in again.");
      window.location.href = "login.html";
      return;
    }

    try {
      console.log("Sending request to verify password...");
      const response = await fetch("http://localhost:5000/verify-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ password, site })
      });

      const result = await response.json();
      if (response.ok) {
        // If the password is correct, remove the site from storage
        chrome.storage.sync.get("blockedSites", (data) => {
          const blockedSites = data.blockedSites || [];
          const updatedSites = blockedSites.filter((s) => s !== site);

          console.log("Updated blockedSites array:", updatedSites);

          chrome.storage.sync.set({ blockedSites: updatedSites }, () => {
            // Notify the background script to update the rules
            chrome.runtime.sendMessage({ action: "updateRules" }, () => {
              alert("Site removed successfully.");
              location.reload(); // Reload the popup to update the list
            });
          });
        });
      } else {
        alert(result.message || "Failed to verify password.");
      }
    } catch (err) {
      console.error("Error verifying password:", err);
      alert("An error occurred while verifying the password. Please try again.");
    }
  });
}


// Add event listeners to remove buttons
blockedSitesList.addEventListener("click", (event) => {
  if (event.target.tagName === "BUTTON" && event.target.classList.contains("remove-site")) {
    const site = event.target.dataset.site;
    removeSite(site);
  }
});

// Logout functionality
logoutButton.addEventListener("click", () => {
  chrome.storage.sync.remove("token", () => {
    window.location.href = "login.html"; // Redirect to login page
  });
});
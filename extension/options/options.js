document.addEventListener("DOMContentLoaded", () => {
  // Load search history from Chrome storage
  chrome.storage.sync.get("searchHistory", (data) => {
    const searchHistory = data.searchHistory || [];
    const historyList = document.getElementById("historyList");
    searchHistory.forEach((site) => {
      historyList.innerHTML += `<li>${site}</li>`;
    });
  });
});

function blockWebsite() {
  const site = document.getElementById("blockSite").value.trim();
  if (!site) {
    alert("Please enter a valid website.");
    return;
  }

  // Save the blocked site to Chrome storage
  chrome.storage.sync.get("blockedSites", (data) => {
    const blockedSites = data.blockedSites || [];
    if (!blockedSites.includes(site)) {
      blockedSites.push(site);
      chrome.storage.sync.set({ blockedSites }, () => {
        alert("Website blocked successfully.");
      });
    } else {
      alert("This website is already blocked.");
    }
  });
}
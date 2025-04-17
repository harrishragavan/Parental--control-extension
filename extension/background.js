// Function to update blocking rules
// Function to update blocking rules
function updateRules(blockedSites) {
  const rules = blockedSites.map((site, index) => ({
    id: index + 1, // Unique ID for each rule
    priority: 1,
    action: { type: "block" },
    condition: { urlFilter: `*://${site}/*`, resourceTypes: ["main_frame"] }
  }));

  // Update dynamic rules
  chrome.declarativeNetRequest.updateDynamicRules(
    {
      removeRuleIds: rules.map((rule) => rule.id), // Remove existing rules
      addRules: rules // Add new rules
    },
    () => {
      console.log("Rules updated:", rules);
    }
  );
}

// Load blocked sites from storage and update rules
chrome.storage.sync.get("blockedSites", (data) => {
  const blockedSites = data.blockedSites || [];
  updateRules(blockedSites);
});

// Listen for changes in blocked sites and update rules
chrome.storage.onChanged.addListener((changes) => {
  if (changes.blockedSites) {
    const blockedSites = changes.blockedSites.newValue || [];
    updateRules(blockedSites);
  }
});

// Listen for messages from the popup script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateRules") {
    chrome.storage.sync.get("blockedSites", (data) => {
      const blockedSites = data.blockedSites || [];
      updateRules(blockedSites);
      sendResponse({ success: true });
    });
    return true; // Keep the message channel open for async response
  }
});

// Load blocked sites from storage and update rules
chrome.storage.sync.get("blockedSites", (data) => {
  const blockedSites = data.blockedSites || [];
  updateRules(blockedSites);
});

// Listen for changes in blocked sites and update rules
chrome.storage.onChanged.addListener((changes) => {
  if (changes.blockedSites) {
    const blockedSites = changes.blockedSites.newValue || [];
    updateRules(blockedSites);
  }
});

// Time-based restrictions logic
function isWithinRestrictedTime(startTime, endTime) {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  const start = startHours * 60 + startMinutes;
  const end = endHours * 60 + endMinutes;

  if (start < end) {
    // Normal case: e.g., 9:00 to 17:00
    return currentTime >= start && currentTime <= end;
  } else {
    // Overnight case: e.g., 22:00 to 6:00
    return currentTime >= start || currentTime <= end;
  }
}

// Periodically check and enforce time-based restrictions
setInterval(() => {
  chrome.storage.sync.get(["timeRestrictions", "blockedSites"], (data) => {
    const { timeRestrictions, blockedSites } = data;

    if (!timeRestrictions || !blockedSites) return;

    const { startTime, endTime } = timeRestrictions;

    if (isWithinRestrictedTime(startTime, endTime)) {
      // Block websites during restricted time
      updateRules(blockedSites);
    } else {
      // Unblock websites outside restricted time
      chrome.declarativeNetRequest.updateDynamicRules(
        { removeRuleIds: blockedSites.map((_, index) => index + 1) },
        () => {
          console.log("Websites unblocked outside restricted time.");
        }
      );
    }
  });
}, 60000); // Check every minute
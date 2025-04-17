async function checkImage(imageUrl) {
  const response = await fetch("https://nudity-detection.p.rapidapi.com/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": "YOUR_FREE_API_KEY",
      "X-RapidAPI-Host": "nudity-detection.p.rapidapi.com"
    },
    body: JSON.stringify({ url: imageUrl })
  });

  const result = await response.json();
  if (result.nudity) {
    alert("Blocked: Inappropriate image detected!");
    document.body.innerHTML = "<h2>Blocked by Parental Control Extension</h2>";
  }
}

// Scan all images on the page
document.querySelectorAll("img").forEach((img) => {
  checkImage(img.src);
});
async function checkText(text) {
  const response = await fetch(`https://www.purgomalum.com/service/containsprofanity?text=${encodeURIComponent(text)}`);
  const isProfane = await response.text();
  
  if (isProfane === "true") {
    alert("Blocked: This page contains inappropriate language!");
    document.body.innerHTML = "<h2>Blocked by Parental Control Extension</h2>";
  }
}

// Scan text content on the page
checkText(document.body.innerText);

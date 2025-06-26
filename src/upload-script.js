// DOM Elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const output = document.getElementById('output');

// Allow clicking the drop zone to open file picker
dropZone.addEventListener('click', () => fileInput.click());

// Handle drag-over visuals
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

// Handle file drop
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');

  const file = e.dataTransfer.files[0];
  if (file) {
    console.log("File dropped:", file.name);
    uploadFile(file);
  }
});

// Handle file selection via Browse button
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    console.log("File selected via Browse:", file.name);
    uploadFile(file);
  } else {
    console.warn("No file selected.");
  }
});

async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file); // must match backend's expected key

  try {
    const response = await fetch("https://purenv-qld-api-backend-e3arg4gsc4g9fbd4.australiaeast-01.azurewebsites.net/api/get_lab", {
      method: "POST",
      body: formData,
      credentials: "omit",   // prevents auth tokens from SWA
      headers: {
        "Accept": "application/json"
        // DO NOT manually set Content-Type!
      }
    });

    const text = await response.text();
    console.log("RAW response:", text);
    console.log("Status:", response.status);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Invalid JSON returned:\n" + text);
    }

    console.log("Success:", data);
  } catch (err) {
    console.error("Upload error:", err.message);
  }
}

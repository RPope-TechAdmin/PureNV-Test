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

// Upload the file to the backend
async function uploadFile(file) {
  if (!file) {
    output.textContent = "No file provided.";
    return;
  }

  console.log("Uploading:", file.name);
  const formData = new FormData();
  formData.append("file", file);

  output.textContent = "Uploading...";

  try {
    const response = await fetch('https://purenv-qld-api-backend-e3arg4gsc4g9fbd4.australiaeast-01.azurewebsites.net/get_lab', {
      method: 'POST',
      body: formData,
      credentials: 'omit',
      headers: {
        'Accept': 'application/json'
      }
    });

    const contentType = response.headers.get("Content-Type") || "";
    const text = await response.text();

    console.log("Status:", response.status);
    console.log("Content-Type:", contentType);
    console.log("Raw response:", text);

    if (!response.ok) {
      throw new Error("Server error: " + response.status);
    }

    if (!contentType.includes("application/json")) {
      throw new Error("Expected JSON but got: " + contentType + "\n" + text);
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error("Invalid JSON Response: " + text);
    }

    output.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    output.textContent = "Error: " + err.message;
    console.error("Upload failed:", err);
  }
}

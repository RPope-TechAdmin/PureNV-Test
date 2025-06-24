const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const output = document.getElementById('output');

console.log("Status:", response.status);
console.log("Content-Type:", response.headers.get("Content-Type"));
console.log("Raw response:", text);

async function uploadFile(file) {
  if (!file) {
    output.textContent = "No file provided to uploadFile().";
    return;
  }

  console.log("Uploading:", file.name);
  const formData = new FormData();
  formData.append("file", file);

  output.textContent = "Uploading...";
  // ... rest of the function
}


dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');

  const file = e.dataTransfer.files[0];
  if (file) {
    uploadFile(file);
  }
});

fileInput.addEventListener('change', (e) => {
  const files = e.target.files;
  if (files && files.length > 0) {
    const file = files[0];
    console.log("File selected via Browse:", file.name);
    uploadFile(file);
  } else {
    console.warn("No file selected.");
  }
});


async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  output.textContent = "Uploading...";

  try {
    const response = await fetch('/api/get_lab', {
      method: 'POST',
      body: formData
    });

    const text = await response.text(); //reading first as text
    console.log("Raw response from server:", text);

    let data;
    try {
      data=JSON.parse(text);
    } catch (e) {
      throw new Error("Invalid JSON Response: " + text);
    }
    
    output.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    output.textContent = "Error: " + err.message;
  }
}

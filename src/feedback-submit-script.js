document.getElementById("feedbackForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const formData = new FormData(e.target);

    const name = formData.get("name");
    const feedback = formData.get("feedback");

    if (!name || !feedback) {
      throw new Error("Both name and feedback fields are required.");
    }
      
        console.log("Payload:", payload);
        console.log("Fetch options:", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          credentials: "omit",
          body: JSON.stringify(payload)
        });

    const payload = { name, feedback };

    const res = await fetch("https://purenv-qld-api-backend-e3arg4gsc4g9fbd4.australiaeast-01.azurewebsites.net/api/feedback", {
      method: "POST",
      headers: {
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            credentials: "omit",
            body: JSON.stringify(payload)
          });

          if (!res.ok) {
            throw new Error(`Server responded with status ${res.status}`);
          }

          const result = await res.json();
          console.log("Response status:", result.code);


        } catch (error) {
          console.error("An error occurred:", error.message);
          alert("Oops! Something went wrong. Please try again later.");
        }
});
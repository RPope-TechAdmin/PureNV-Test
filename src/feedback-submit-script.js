document.getElementById("feedbackForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const formData = new FormData(e.target);
    const name = formData.get("name");
    const feedback = formData.get("feedback");

    if (!name || !feedback) {
      console.warn("Form submission failed: name or feedback missing.");
      throw new Error("Both name and feedback fields are required.");
    }

    const payload = { name, feedback };
    const endpoint = "https://purenv-qld-api-backend-e3arg4gsc4g9fbd4.australiaeast-01.azurewebsites.net/api/feedback";

    console.log("[Feedback Submit] Sending payload:", payload);
    console.log("[Feedback Submit] Endpoint:", endpoint);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      credentials: "omit",
      body: JSON.stringify(payload)
    });

    console.log("[Feedback Submit] Response status:", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("[Feedback Submit] Server error response:", errorText);
      throw new Error(`Server responded with status ${res.status}`);
    }

    const result = await res.json();
    console.log("[Feedback Submit] Success:", result);

    alert("Feedback submitted successfully!");

  } catch (error) {
    console.error("[Feedback Submit] An error occurred:", error.message);
    alert("Oops! Something went wrong. Please try again later.");
  }
});

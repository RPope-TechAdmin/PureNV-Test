// ----- MSAL Configuration -----
const msalConfig = {
  auth: {
    clientId: "bce610d8-2607-48f3-b6e2-fd9acef2732d",
    authority: "https://login.microsoftonline.com/655e497b-f0e8-44ed-98fb-77680dd02944",
    redirectUri: window.location.href  // 🔁 Return here after login
  }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

// ----- Show error message in a div -----
function showError(message) {
  const errorDiv = document.getElementById("feedbackError");
  if (errorDiv) {
    errorDiv.style.display = "block";
    errorDiv.innerText = message;
  } else {
    alert(message); // fallback
  }
}

// ----- Submit Feedback to API -----
async function sendFeedback(name, feedback) {
  try {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length === 0) {
      // 🔐 Store form data and redirect for login
      sessionStorage.setItem("pendingFeedback", JSON.stringify({ name, feedback }));
      msalInstance.loginRedirect({
        scopes: ["api://bce610d8-2607-48f3-b6e2-fd9acef2732d/user_impersonation"]
      });
      return;
    }

    const account = accounts[0];
    const tokenResponse = await msalInstance.acquireTokenSilent({
      scopes: ["api://bce610d8-2607-48f3-b6e2-fd9acef2732d/user_impersonation"],
      account: account
    });

    const res = await fetch("https://purenv-qld-api-backend-e3arg4gsc4g9fbd4.australiaeast-01.azurewebsites.net/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${tokenResponse.accessToken}`
      },
      body: JSON.stringify({ name, feedback })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("[Feedback Submit] Server error:", errorText);
      showError(`Server error: ${res.status}`);
      return;
    }

    const result = await res.json();
    console.log("[Feedback Submit] Success:", result);
    alert("Feedback submitted successfully!");
  } catch (error) {
    console.error("[Feedback Submit] Error:", error.message);
    showError("Something went wrong: " + error.message);
  }
}

// ----- Form Submission Handler -----
document.getElementById("feedbackForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const name = formData.get("name");
  const feedback = formData.get("feedback");

  if (!name || !feedback) {
    showError("Both name and feedback fields are required.");
    return;
  }

  console.log("Submitting feedback:", { name, feedback });
  await sendFeedback(name, feedback);
});

// ----- Resume Feedback Submission After Redirect Login -----
window.addEventListener("DOMContentLoaded", async () => {
  try {
    await msalInstance.handleRedirectPromise(); // 🧠 required to process auth
    const pending = sessionStorage.getItem("pendingFeedback");
    if (pending) {
      const { name, feedback } = JSON.parse(pending);
      sessionStorage.removeItem("pendingFeedback");
      console.log("Resuming feedback submission after login...");
      await sendFeedback(name, feedback);
    }
  } catch (e) {
    console.error("MSAL redirect handling error:", e);
    showError("Login failed or was interrupted.");
  }
});

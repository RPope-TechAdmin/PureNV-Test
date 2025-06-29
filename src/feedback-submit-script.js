// ----- MSAL Configuration -----
const msalConfig = {
  auth: {
    clientId: "bce610d8-2607-48f3-b6e2-fd9acef2732d",
    authority: "https://login.microsoftonline.com/655e497b-f0e8-44ed-98fb-77680dd02944",
    redirectUri: window.location.href // ensures redirect returns here
  }
};

const loginRequest = {
  scopes: [
    "api://bce610d8-2607-48f3-b6e2-fd9acef2732d/user_impersonation",
    "openid",
    "profile",
    "offline_access"]
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

// ----- UI feedback -----
function showError(message) {
  const errorDiv = document.getElementById("feedbackError");
  errorDiv.style.display = "block";
  errorDiv.innerText = message;
}

function showSuccess(message) {
  const successDiv = document.getElementById("feedbackSuccess");
  successDiv.style.display = "block";
  successDiv.innerText = message;
}

// ----- Acquire Token or Login -----
async function getAccessToken() {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) {
    // 👇 popup must be inside the user-initiated flow
    return await msalInstance.loginPopup(loginRequest)
      .then(async () => {
        const account = msalInstance.getAllAccounts()[0];
        const result = await msalInstance.acquireTokenSilent({
          ...loginRequest,
          account
        });
        return result.accessToken;
      })
      .catch((err) => {
        console.error("Popup login failed:", err);
        return null;
      });
  }

  try {
    const result = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: accounts[0]
    });
    return result.accessToken;
  } catch (e) {
    console.warn("Silent failed, trying popup...");
    try {
      const result = await msalInstance.acquireTokenPopup(loginRequest);
      return result.accessToken;
    } catch (err) {
      console.error("Popup token fetch failed:", err);
      return null;
    }
  }
}

// ----- Submit Feedback -----
async function sendFeedback(name, feedback) {
  const token = await getAccessToken();
  if (!token) {
    console.error("No Token Available")
    return;
  }

  console.log("Access Token:", token);

  try {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ name, feedback })
    });

    if (!res.ok) {
      const errorText = await res.text();
      showError(`Error: ${res.status} - ${errorText}`);
      return;
    }

    const result = await res.json();
    console.log("Feedback result:", result);
    showSuccess("Feedback submitted successfully!");
  } catch (err) {
    console.error("Submission error:", err);
    showError("Submission failed. Check console for details.");
  }
}

// ----- Form handler -----
document.getElementById("feedbackForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  document.getElementById("feedbackError").style.display = "none";
  document.getElementById("feedbackSuccess").style.display = "none";

  const formData = new FormData(e.target);
  const name = formData.get("name");
  const feedback = formData.get("feedback");

  console.log("[Submit] Name:", name);
  console.log("[Submit] Feedback:", feedback);

  if (!name || !feedback) {
    showError("Name and feedback are required.");
    return;
  }

  await sendFeedback(name, feedback);
});

// ----- Resume flow after login redirect -----
window.addEventListener("DOMContentLoaded", async () => {
  try {
    await msalInstance.handleRedirectPromise(); // required!
  } catch (e) {
    console.error("MSAL redirect error:", e);
  }
});

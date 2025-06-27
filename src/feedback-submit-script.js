document.getElementById("feedbackForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const formData = new FormData(e.target);
    const name = formData.get("name");
    const feedback = formData.get("feedback");

    if (!name || !feedback) {
      throw new Error("Both name and feedback fields are required.");
    }

    const payload = { name, feedback };

    console.log("Final payload:", JSON.stringify(payload));
    console.log("Headers:", {
      "Content-Type": "application/json",
      "Accept": "application/json"
    });

    const msalConfig = {
      auth: {
        clientId: "bce610d8-2607-48f3-b6e2-fd9acef2732d",
        authority: "https://login.microsoftonline.com/655e497b-f0e8-44ed-98fb-77680dd02944",
        redirectUri: window.location.origin
      }
    };

    const tokenRequest = {
      scopes: ["api://bce610d8-2607-48f3-b6e2-fd9acef2732d/user_impersonation"]
    };

    const msalInstance = new msal.PublicClientApplication(msalConfig);

    async function sendFeedback() {
      const account = msalInstance.getAllAccounts()[0];

      sessionStorage.setItem("postLoginAction", "submitFeedback");

      const postLoginAction = sessionStorage.getItem("postLoginAction")

      if (!account) {
        if (postLoginAction==="submitFeedback") {
          console.log("No account found, redirecting to login...");
          await msalInstance.loginRedirect({
            scopes: ["api://bce610d8-2607-48f3-b6e2-fd9acef2732d/user_impersonation"]
          });
          return;
        }
    }

      const tokenResponse = await msalInstance.acquireTokenSilent({
        scopes: ["api://bce610d8-2607-48f3-b6e2-fd9acef2732d/user_impersonation"],
        account: account
      });

      const token = tokenResponse.accessToken;

      console.log("[Feedback Submit] Sending token:", token);

      const res = await fetch("https://purenv-qld-api-backend-e3arg4gsc4g9fbd4.australiaeast-01.azurewebsites.net/api/feedback", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`, // ✅ Auth header added
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
    }

    // ✅ Now call the function
    await sendFeedback();

  } catch (error) {
    console.error("[Feedback Submit] An error occurred:", error.message);
    showError(`Error: ${error.message}`);
    function showError(message) {
      const errorDiv = document.getElementById("responseMessage");
      errorDiv.style.display = "block";
      errorDiv.textContent = message;
    }
  }
});

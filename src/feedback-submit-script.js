document.getElementById("feedbackForm").addEventListener("submit", async (e) => {
  e.preventDefault();

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
        clientId: "767020ce-1519-45e6-94c8-a3b8620230b3",
        authority: "https://login.microsoftonline.com/655e497b-f0e8-44ed-98fb-77680dd02944",
        redirectUri: window.location.origin
      }
    };


  const msalInstance = new msal.PublicClientApplication(msalConfig);
  
  async function sendFeedback() {
    const account = msalInstance.getAllAccounts()[0];

    if (!account) {
      await msalInstance.loginRedirect({ scopes: ["api://767020ce-1519-45e6-94c8-a3b8620230b3/user_impersonation"] });
      return;
    }

    const tokenResponse = await msalInstance.acquireTokenSilent({
      scopes: ["api://767020ce-1519-45e6-94c8-a3b8620230b3/user_impersonation"],
      account: account
    });

  const token = tokenResponse.accessToken;
    const res = await fetch("https://purenv-qld-api-backend-e3arg4gsc4g9fbd4.australiaeast-01.azurewebsites.net/api/feedback", {
      method: "POST",
      headers: {
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            credentials: "omit",
            body: JSON.stringify(payload)
          });

      console.log("Payload:", payload);
              console.log("Fetch options:", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${token}`,
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
}});
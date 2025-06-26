document.getElementById("dataForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);

  const payload = {
    name: formData.get("name"),
    feedback: formData.get("feedback")
  };

  const res = await fetch("https://https://calm-smoke-0485c311e.2.azurestaticapps.net/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const result = await res.json();
  console.log(result);
});
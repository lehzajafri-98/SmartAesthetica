const fs = require('fs');

async function triggerFrontendMock() {
  const loginRes = await fetch("http://localhost:8000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "essabintahir0802@gmail.com", password: "password123" }) // My local test user might have different password...
  });

  // Just blindly signup a user to guarantee we have auth token.
  const ts = Date.now();
  const signupRes = await fetch("http://localhost:8000/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Essa", email: `essa${ts}@test.com`, password: "password123" })
  });
  
  const token = (await signupRes.json()).token;

  // Simulate exact UI submit
  const revRes = await fetch("http://localhost:8000/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ rating: 5, comment: "Triggering error from Next handler" })
  });

  if (!revRes.ok) {
    const errText = await revRes.text();
    console.log("FAILED WITH:", errText);
  } else {
    console.log("SUCCESS");
  }
}

triggerFrontendMock();

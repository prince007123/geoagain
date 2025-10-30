import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// ✅ Serve a simple HTML page with a "Check Email Send" button
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>GeoFence Email Test</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          text-align: center;
          margin-top: 80px;
          background: linear-gradient(to right, #1e3a8a, #3b82f6);
          color: white;
        }
        button {
          background-color: #10b981;
          color: white;
          border: none;
          padding: 12px 25px;
          font-size: 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: 0.3s;
        }
        button:hover {
          background-color: #059669;
        }
      </style>
      <script>
        async function testEmailSend() {
          const latitude = 28.6139;   // dummy coordinates
          const longitude = 77.2090;

          try {
            const res = await fetch("/alert", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ latitude, longitude })
            });
            const data = await res.json();
            console.log("Server response:", data);
            alert(data.ok ? "✅ Email sent successfully!" : "❌ Failed to send email");
          } catch (err) {
            console.error(err);
            alert("⚠️ Error connecting to server!");
          }
        }
      </script>
    </head>
    <body>
      <h2>📧 GeoFence Email Alert Test</h2>
      <p>Click below to test if Resend email works properly.</p>
      <button onclick="testEmailSend()">Check Email Send</button>
    </body>
    </html>
  `);
});

// ✅ Email alert route
app.post("/alert", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: \`Bearer \${RESEND_API_KEY}\`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "GeoFence Alert <alert@geofence.app>",
        to: ["uk05065020524@gmail.com"],
        subject: "🚨 GeoFence Alert: User Outside Boundary!",
        html: \`
          <h2>⚠️ User exited GeoFence area!</h2>
          <p><b>Latitude:</b> \${latitude}</p>
          <p><b>Longitude:</b> \${longitude}</p>
          <p><a href="https://maps.google.com/?q=\${latitude},\${longitude}">View on Google Maps 🌍</a></p>
        \`,
      }),
    });

    const data = await response.json();
    console.log("📧 Resend response:", data);

    if (response.ok) {
      res.json({ ok: true, message: "Email sent successfully ✅" });
    } else {
      res.status(500).json({ ok: false, error: data });
    }
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(\`🚀 GeoFence backend (Resend) running on port \${PORT}\`);
});


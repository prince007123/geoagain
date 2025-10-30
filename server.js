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

// ✅ Root check route
app.get("/", (req, res) => {
  res.json({ ok: true, msg: "GeoFence backend with Resend running ✅" });
});

// ✅ Route for sending geofence alert emails
app.post("/alert", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev", // ✅ verified sender
        to: ["uk05065020524@gmail.com"],
        subject: "🚨 GeoFence Alert: User Outside Boundary!",
        html: `
          <h2>⚠️ User exited GeoFence area!</h2>
          <p><b>Latitude:</b> ${latitude}</p>
          <p><b>Longitude:</b> ${longitude}</p>
          <p><a href="https://maps.google.com/?q=${latitude},${longitude}">View on Google Maps 🌍</a></p>
        `,
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

// ✅ Test mail route
app.get("/test-mail", async (req, res) => {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev", // ✅ verified sender
        to: ["uk05065020524@gmail.com"],
        subject: "✅ Test Email from GeoFence Backend",
        html: "<p>This is a test email confirming Resend integration works perfectly!</p>",
      }),
    });

    const data = await response.json();
    console.log("📨 Test mail response:", data);

    if (response.ok) {
      res.json({ ok: true, message: "Test email sent successfully ✅" });
    } else {
      res.status(500).json({ ok: false, error: data });
    }
  } catch (error) {
    console.error("❌ Error sending test mail:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 GeoFence backend (Resend) running on port ${PORT}`);
});

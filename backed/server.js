import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

// Generate token
async function getToken() {
  const auth = Buffer.from(
    process.env.CONSUMER_KEY + ":" + process.env.CONSUMER_SECRET
  ).toString("base64");

  const res = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: "Basic " + auth } }
  );

  return res.data.access_token;
}

// STK PUSH endpoint
app.post("/stkpush", async (req, res) => {
  const { phone, amount } = req.body;

  try {
    const token = await getToken();

    const timestamp = new Date()
      .toISOString()
      .replace(/[-:TZ.]/g, "")
      .slice(0, 14);

    const password = Buffer.from(
      process.env.SHORTCODE + process.env.PASSKEY + timestamp
    ).toString("base64");

    const stkData = {
      BusinessShortCode: process.env.SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: process.env.SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: process.env.CALLBACK_URL,
      AccountReference: "Payment",
      TransactionDesc: "Website Checkout",
    };

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      stkData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json(err.response ? err.response.data : err);
  }
});

// Callback URL
app.post("/callback", (req, res) => {
  console.log("----- M-PESA CALLBACK -----");
  console.log(JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

// Start server
app.listen(3000, () => console.log("Daraja backend running on port 3000"));

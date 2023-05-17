require('dotenv').config()

const express = require("express");
const axios = require("axios");
const twilio = require("twilio");

const app = express();
const PORT = 3000; // Replace with your desired port number


const apiUrl = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter";
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Middleware to parse JSON in the request body
app.use(express.json());

// Route for handling incoming SMS messages
app.post("/sms", async (req, res) => {
  const { query, From } = req.body; // Assuming the query and sender's phone number are provided in the request body

  // Make the request to the NOAA API
  const response = await axios.get(apiUrl, {
    params: {
      date: "latest",
      station: "9410230",
      product: "water_level",
      datum: "MLLW",
      time_zone: "lst_ldt",
      units: "english",
      format: "json",
    },
  });

  const responseData = response.data; // Process the response as needed

  const waterLevel = parseFloat(responseData.data[0].v); // Extract the water level value

  const thresholdLow = 2.0; // Threshold value for low tide
  const thresholdHigh = 4.0; // Threshold value for high tide

  let responseMessage = ""; // Initialize the response message

  if (waterLevel < thresholdLow) {
    responseMessage = "It is low tide. You can hike!";
  } else if (waterLevel > thresholdHigh) {
    responseMessage = "It is high tide. Hiking is not recommended.";
  } else {
    responseMessage =
      "The tide is neither low nor high. Exercise caution while hiking.";
  }

  // Include additional tide information in the response message
  if (responseData.metadata && responseData.metadata.name) {
    responseMessage += `\nTide Information:
    - Station: ${responseData.metadata.name}
    - Latitude: ${responseData.metadata.lat}
    - Longitude: ${responseData.metadata.lon}
    - Time: ${responseData.data[0].t}
    - Water Level: ${responseData.data[0].v} ft
    - Sensor Type: ${responseData.data[0].s}
    - Quality: ${responseData.data[0].q}`;
  }

  // Create a new Twilio client with your account SID and auth token
  const client = twilio(twilioAccountSid, twilioAuthToken);

  // Send an SMS response using Twilio
  client.messages
    .create({
      body: responseMessage,
      from: twilioPhoneNumber,
      to: From, // Reply to the sender's phone number
    })
    .then(() => {
      console.log("SMS response sent successfully");
    })
    .catch((error) => {
      console.error("Error sending SMS response:", error);
    });

  // Send a success response back to the HTTP request
  res.sendStatus(200);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

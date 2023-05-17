const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000; // Replace with your desired port number

const apiUrl = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter";

// Middleware to parse JSON in the request body
app.use(express.json());

// Route for handling incoming SMS messages
app.post("/sms", async (req, res) => {
  const { query } = req.body; // Assuming the query is provided in the request body

  console.log(query)

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

  const data = response.data; // Process the response as needed

  console.log(data)

  // Generate a response message based on the water level data
  let responseMessage = "";
  // Add your logic to determine the hikeability status and construct the response message accordingly

  // Send the response message back in the HTTP response
  res.json({ message: responseMessage });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

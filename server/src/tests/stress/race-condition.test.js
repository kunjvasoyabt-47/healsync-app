const axios = require('axios');

// 🟢 Use your actual backend URL
const API_URL = 'http://localhost:5000/api/appointments'; 
// 🟢 Paste a real DoctorProfile ID (from Prisma Studio)
const DOCTOR_ID = 'dc9a483a-ca73-414a-b59f-e1bd2b782c19'; 
// 🟢 Paste a fresh Access Token from Chrome
const AUTH_TOKEN1 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ZGFiN2M5Ny0xYzZkLTQ3Y2MtOTY4Mi0wM2FjMzVjMzdiZjUiLCJyb2xlIjoiUEFUSUVOVCIsInByb2ZpbGVJZCI6ImU0N2QxNzhlLTM2MWUtNGRlNS1hOWNhLTU0YThjNzQyM2NhZCIsInZlcnNpb24iOjUsImlhdCI6MTc3MDM1NjQwOSwiZXhwIjoxNzcwMzU3MzA5fQ.1yJduh4tZMNVKXroMfuif5NPNFBNjaI0vLS8Dyq3jC0'; 
const AUTH_TOKEN2 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3YWRlZGQ5ZS03NmQ3LTRjYTItODk1OS01NzZiZTVlNzZkMjUiLCJyb2xlIjoiUEFUSUVOVCIsInByb2ZpbGVJZCI6ImMyYTY5M2YwLTE0MTUtNGQ1NC05ZGNkLTM1MzI1ODdjNTBhNCIsInZlcnNpb24iOjcsImlhdCI6MTc3MDM1NDA0OSwiZXhwIjoxNzcwMzU0OTQ5fQ.CeI4_TcNfrEz2NVLeCEjvmAgChjzMm152UT3lf2HAOg'; 

const testData = {
  doctorId: DOCTOR_ID,
  date: "2026-02-06", // Ensure this is a new date for every test
  timeSlot: "10:30 AM",
  reason: "Race Condition Test",
  symptoms: "Testing 123"
};

async function runTest() {
  console.log("Checking path and starting race test...");
  
  const req1 = axios.post(API_URL, testData, { headers: { Authorization: `Bearer ${AUTH_TOKEN1}` } });
  const req2 = axios.post(API_URL, testData, { headers: { Authorization: `Bearer ${AUTH_TOKEN2}` } });

  const results = await Promise.allSettled([req1, req2]);

  results.forEach((res, i) => {
    if (res.status === 'fulfilled') {
      console.log(`Req ${i+1}: Success (201)`);
    } else {
      console.log(`Req ${i+1}: Blocked (409) - Message: ${res.reason.response.data.error}`);
    }
  });
}

runTest();
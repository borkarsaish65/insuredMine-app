# Project Information

**Project Name:** insuredmine-app  
**Version:** 1.0.0  

## Description
This project is aimed at implementing various APIs and functionalities related to managing insurance data.

## Dependencies
- csv-parser: ^3.0.0
- dotenv: ^16.4.5
- moment: ^2.30.1
- moment-timezone: ^0.5.45
- mongoose: ^8.2.0
- nodemon: ^3.1.0
- pidusage: ^3.0.2

# Tasks

## Task 1

### 1. API to Upload XLSX/CSV Data into MongoDB
- Create an API endpoint to upload XLSX/CSV data into MongoDB.
- Utilize worker threads for processing data to ensure efficient handling of large datasets.

### 2. Search API for Policy Info
- Implement an API endpoint to search for policy information based on the username.
- Retrieve policy information from MongoDB collections such as Agent, User, User's Account, LOB, Carrier, Policy.

### 3. API for Aggregated Policy by User
- Develop an API endpoint to provide aggregated policy information for each user.
- Aggregate policy data from MongoDB collections.

### 4. Data Organization in MongoDB
- Consider each piece of information (Agent, User, User's Account, LOB, Carrier, Policy) as a separate collection in MongoDB.

## Task 2

### 1. Real-Time CPU Utilization Tracking
- Implement functionality to track the real-time CPU utilization of the Node.js server.
- Utilize a monitoring tool such as `pidusage` to measure CPU usage.
- If CPU utilization exceeds 70%, restart the server to optimize performance.

### 2. Post-Service for Scheduled Message Insertion
- Create a post-service API that accepts parameters for message, day, and time.
- Insert the message into the database at the specified day and time.
- Utilize libraries like `moment.js` for handling time calculations and scheduling.

---

# Running Instructions for insuredmine-app

Follow these instructions to run the insuredmine-app:

```bash

1.Clone the insuredmine-app repository from the source.
git clone <repository_url>

2.cd insuredmine-app
npm install

3. Set Environment Variables
Create a .env file in the project root directory and set any necessary environment variables.

4.npm start


**Note:** All tasks asked has been implemented

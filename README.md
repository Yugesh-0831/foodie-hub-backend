# Flight Booking Backend

This is the backend application for the flight booking system. It handles flight bookings, updates, and notifications.

## Features

- Manage flight data (CRUD operations).
- Handle user bookings and provide real-time updates.
- Send notifications via email and SMS when flight details are updated.

## Tech Stack

- Node.js
- Express.js
- MongoDB for database
- Socket.IO for real-time updates
- Nodemailer for email notifications
- Twilio for SMS notifications

## Prerequisites

- Node.js (v12 or later)
- MongoDB
- npm or yarn

## Getting Started

1. Clone the repository:
    ```sh
    git clone https://github.com/Yugesh-0831/indigo-hackathon-backend.git
    cd indigo-hackathon-backend
    ```

2. Install dependencies:
    ```sh
    npm install
    # or
    yarn install
    ```

3. Set up environment variables:
    - Create a `.env` file in the root directory and add the following variables:
        ```env
        MONGODB_URI=your_mongodb_connection_string
        EMAIL_USER=your_email_user
        EMAIL_PASS=your_email_password
        TWILIO_ACCOUNT_SID=your_twilio_account_sid
        TWILIO_AUTH_TOKEN=your_twilio_auth_token
        TWILIO_PHONE_NUMBER=your_twilio_phone_number
        ```

4. Start the development server:
    ```sh
    npm start
    # or
    yarn start
    ```

5. The server will be running at `http://localhost:8080`.

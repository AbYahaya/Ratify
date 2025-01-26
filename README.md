Project Overview
This project is a Payment and Receipt Generation System for the Nigeria Association of Computing Students, ABU, designed with the following key features:

- Secure payment processing using the Paystack API.
- Dynamic receipt generation using PDFKit.
- An admin dashboard to manage and view all transactions.
- Uses MongoDB as the database for storing transaction records.
- Built with Node.js and Express, with endpoints for payments, receipts, and admin functionalities.
  
Project Features

1. Payment Processing
Users can initiate a payment from the home page by providing their name, email, and amount.
The system integrates with Paystack, creating an authorization URL for the user to complete payment securely.
On successful payment:
The system generates a receipt in PDF format.
Saves the transaction details in a MongoDB database.
Provides the user with a link to download the receipt.
2. Receipt Generation
The receipt is generated using PDFKit.
Includes the following details:
Association Name: Styled as large and italicized.
Transaction Reference.
User's Name and Email.
Amount paid (formatted as currency).
Payment Status.
Date of transaction.
Receipts are stored in a receipts/ folder, with filenames structured as receipt_<reference>.pdf.
Receipts are served as static files via the /receipts route.
3. Admin Dashboard
Protected by a password (ADMIN_PASSWORD stored in environment variables).
Login Endpoint: Allows admins to authenticate using the password.
Transactions Endpoint: Provides a list of all transactions recorded in the database, including:
User details.
Payment amount.
Transaction reference.
Payment status.
Timestamp.
4. Database
MongoDB is used to persist transaction details.
Transaction Model:
name: User's name.
email: User's email address.
amount: Payment amount in kobo.
reference: Unique transaction reference.
status: Payment status (e.g., success).
createdAt: Timestamp of the transaction.


Endpoints Overview
Public Endpoints
Welcome Page:

GET /
Displays a welcome message.
Initiate Payment:

POST /api/payments/create
Body: { "name": "John Doe", "email": "john.doe@example.com", "amount": 5000 }
Creates a payment authorization URL via Paystack.
Payment Callback:

GET /api/payments/callback
Handles the callback from Paystack after payment.
Download Receipt:

GET /receipts/<receipt_filename>
Serves the generated receipt.

Admin Endpoints
Admin Login:

POST /api/admin/login
Body: { "password": "your_admin_password" }
Authenticates admin access.
View Transactions:

GET /api/admin/transactions
Retrieves all transactions stored in the database.

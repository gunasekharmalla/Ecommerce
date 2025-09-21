# Ecommerce Project

A simple eCommerce backend API built with Node.js / Express / MongoDB. Holds user registration, login/auth with JWT, product management, etc.
Live link: https://ecommerce-8gcd.onrender.com
---

## Table of Contents

1. [Features](#features)  
2. [Tech Stack](#tech-stack)  
3. [Setup & Run](#setup--run)  
4. [Environment Variables](#environment-variables)  
5. [API Endpoints](#api-endpoints)  
6. [Error Handling](#error-handling)  
7. [Notes / Future Work](#notes--future-work)

---

## Features

- User registration and login with JWT authentication  
- Password hashing  
- CRUD for products (if implemented)  
- Secure routes (protected by JWT)  
- Middleware for error handling / authorization  

---

## Tech Stack

- Node.js  
- Express.js  
- MongoDB Mongoose  
- JWT (JSON Web Token)  
- bcrypt for password hashing  

---

## Setup & Run

1. Clone the repository:

   ```bash
   git clone https://github.com/gunasekharmalla/Ecommerce.git
   cd Ecommerce
   npm install
PORT=5000
MONGODB_URI=<your mongo connection string>
JWT_SECRET=<a strong random string>
npm start

Route	Method	Authentication	Request Body	Response Success	Possible Errors / Notes
POST-- https://ecommerce-8gcd.onrender.com/register	=>	No	{ "name": String, "email": String, "password": String }	{ "message": "User registered successfully", "user": {                                                            (_id, name, email, ...) } }	400 if missing fields or email already exists, 500 internal errors

POST -- https://ecommerce-8gcd.onrender.com/login	   => 	No	{ "email": String, "password": String }	{ "token": "<JWT token>", "user": { (_id, name, email, ...) } }	                                                               400 if invalid credentials, 500 if server error or JWT_SECRET missing
GET -- https://ecommerce-8gcd.onrender.com/users/:id	=>  	Yes (JWT)	—	{ "user": { ... } }	401 if no token / invalid token, 404 if user not found
PUT -- https://ecommerce-8gcd.onrender.com/users/:id	=> 	Yes (JWT)	{ name?, email?, password? }	{ "message": "User updated successfully", "user": { ... } }	401 / 403                                                               if unauthorized, 400 invalid input
DELETE -- https://ecommerce-8gcd.onrender.com/users/:id	=>	Yes (JWT)	—	{ "message": "User deleted successfully" }	401 / 403, 404 if user not found

Products CRUD routes 
GET -- https://ecommerce-8gcd.onrender.com/products, 
GET -- https://ecommerce-8gcd.onrender.com/product/:id, 
POST -- https://ecommerce-8gcd.onrender.com/product, 
DELETE -- https://ecommerce-8gcd.onrender.com/products/:id	Some protected, some public (depending)	{fields as per product model}	JSON of products or confirmation messages	Validations, auth, 404 not found etc.
Error Handling

All responses for failures return with appropriate HTTP status codes (4xx for client issues, 5xx for server issues).

Common error messages:

"User not found"

"Invalid credentials"

"secretOrPrivateKey must have a value" — means JWT_SECRET is not set or misconfigured

Logging to console / server logs is enabled for debugging in development.

Sample Client Flow

Register a new user

Login with the same user → get JWT token

Use the JWT token in Authorization header (Bearer <token>) to access protected routes

Future Work

Add password reset functionality

Add roles (admin, user) and permissions

Add product categories, search, pagination

Validate inputs strictly (using Joi or express-validator)

Rate-limiting, security hardening

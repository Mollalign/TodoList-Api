# To-Do List Web Application (Backend)

## Overview
The backend is built with **Node.js** and **Express.js** to handle REST API requests. It uses **MongoDB** as the database, with **Mongoose** as the ODM. Authentication is managed via **JWT**, and passwords are hashed using **bcryptjs**.

## Tech Stack
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT for authentication
- bcryptjs for password hashing
- express-validator for validation

## API Endpoints
| Method | Endpoint     | Description                          |
|--------|--------------|--------------------------------------|
| POST   | `/register`  | Register a new user                  |
| POST   | `/login`     | Authenticate user and return JWT     |
| POST   | `/tasks`     | Create a new task                    |
| GET    | `/tasks`     | Retrieve list of user tasks          |
| PUT    | `/tasks/:id` | Update a specific task               |
| DELETE | `/tasks/:id` | Delete a specific task               |

## Models

### User

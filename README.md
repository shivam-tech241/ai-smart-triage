# AI Smart Hospital Triage System

An AI-assisted full-stack hospital triage application designed to help prioritize patients, manage patient queues, and support hospital staff through an integrated web application.

The system combines a **React frontend, Node.js/Express backend, SQLite database, and dedicated Python FastAPI AI service** to provide a modular architecture for AI-assisted patient triage.

> **Disclaimer:** This is an academic/prototype project and is not intended for real-world medical diagnosis or clinical decision-making.

---

## Overview

In busy hospital environments, patients may require different levels of attention and urgency. Efficiently organizing patients and managing queues can help healthcare staff respond to critical cases more effectively.

The **AI Smart Hospital Triage System** explores how AI can be integrated into a hospital workflow to assist with patient prioritization while keeping the frontend, backend, database, and AI processing separated into dedicated components.

### Core Capabilities

* AI-assisted patient triage
* Priority-based patient management
* Patient queue management
* Patient management
* User authentication and authorization
* Administrative functionality
* Audit middleware
* Password-strength validation during registration
* Separate Python AI service
* SQLite-based data persistence

---

## System Architecture

```text
                         +----------------------+
                         |    React Frontend    |
                         |   Vite + Tailwind    |
                         +----------+-----------+
                                    |
                                    | HTTP / API
                                    v
                         +----------------------+
                         |  Node.js + Express   |
                         |       Backend        |
                         +-------+-------+------+
                                 |       |
                    +------------+       +-------------+
                    |                                  |
                    v                                  v
          +------------------+              +------------------+
          | SQLite Database  |              |  Python FastAPI  |
          |  better-sqlite3  |              |   AI Service     |
          +------------------+              +--------+---------+
                                                     |
                                                     v
                                            +------------------+
                                            | Random Forest ML |
                                            |    Classifier    |
                                            +------------------+
```

### Architecture Components

#### Frontend

The frontend is built using **React and Vite**, with **Tailwind CSS** used for the interface.

It provides the user-facing application through which users interact with the hospital triage workflow.

#### Backend

The backend is built using **Node.js and Express.js**.

It provides the application's core API and includes dedicated modules for:

* Authentication
* Patient management
* Queue management
* Administration
* Database interaction
* Authentication middleware
* Audit middleware

#### Database

The application uses **SQLite** with `better-sqlite3` for local data persistence.

#### AI Service

The AI component is implemented as a separate **Python FastAPI service**.

The service receives patient information, prepares the required features, passes them through a trained **Random Forest classifier**, and returns the resulting triage/risk prediction.

---

## AI Triage Service

The project uses a dedicated Python service to handle AI-based triage processing independently from the main Node.js backend.

### AI Processing Flow

```text
Patient Information
        |
        v
Node.js / Express Backend
        |
        v
Python FastAPI Service
        |
        v
Feature Preparation
        |
        v
Random Forest Classifier
        |
        v
Triage / Risk Prediction
        |
        v
Backend Response
        |
        v
React Frontend
```

### AI Service Responsibilities

* Accept patient information through an API endpoint.
* Prepare input features for the trained model.
* Run the Random Forest classifier.
* Process the model output.
* Generate an AI-assisted triage/risk prediction.
* Return the prediction to the application backend.

Keeping the AI service separate allows the machine-learning component to be maintained independently from the core application.

---

## Features

### AI-Assisted Triage

The system uses a trained machine-learning classifier to assist with patient triage and risk prioritization.

### Patient Management

The backend provides dedicated patient controllers and routes for handling patient-related operations.

### Queue Management

A dedicated queue module helps organize patients according to the application's triage workflow.

### Authentication

The application includes authentication functionality using:

* JWT-based authentication
* Password hashing with bcrypt
* Authentication middleware
* Dedicated authentication routes and controllers

### Password Strength Validation

The registration workflow includes password-strength validation to encourage stronger user credentials.

### Administration

Dedicated administrative routes and controllers provide functionality for administrative operations.

### Audit Middleware

The backend includes audit middleware for tracking relevant application activity.

---

## Technology Stack

### Frontend

* React 19
* Vite
* Tailwind CSS
* Axios
* Lucide React

### Backend

* Node.js
* Express.js
* JSON Web Tokens (JWT)
* bcryptjs
* CORS
* dotenv

### Database

* SQLite
* better-sqlite3

### AI / Machine Learning

* Python
* FastAPI
* Random Forest
* Machine Learning

### Development Tools

* Git
* GitHub
* npm
* ESLint
* Concurrently

---

## Project Structure

```text
ai-smart-triage/
|
├── ai_service/
│   └── ai_server.py
|
├── backend/
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── patientController.js
│   │   └── queueController.js
│   |
│   ├── db/
│   │   └── db.js
│   |
│   ├── middleware/
│   │   ├── audit.js
│   │   └── auth.js
│   |
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── patientRoutes.js
│   │   └── queueRoutes.js
│   |
│   ├── .env.example
│   └── server.js
|
├── public/
├── src/
|
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## Application Workflow

```text
                    +--------------+
                    |     User     |
                    +------+-------+
                           |
                           v
                 +------------------+
                 | React Frontend   |
                 +--------+---------+
                          |
                          v
                 +------------------+
                 | Express Backend  |
                 +--------+---------+
                          |
              +-----------+------------+
              |           |            |
              v           v            v
        Authentication  Patients     Queue
              |           |            |
              +-----------+------------+
                          |
                          v
                  +---------------+
                  |  AI Service   |
                  | Python/FastAPI|
                  +-------+-------+
                          |
                          v
                  Random Forest
                    Classifier
                          |
                          v
                  Triage / Risk
                    Prediction
```

---

## Security Considerations

The project implements several basic security practices:

* JWT-based authentication
* Password hashing using bcrypt
* Authentication middleware
* Password-strength validation
* Environment-based configuration
* `.env` files excluded from version control
* Local database files excluded from version control
* Audit middleware for application activity

Sensitive configuration and credentials should remain outside the repository.

---

## Getting Started

### Prerequisites

Make sure the following are installed:

* Node.js
* npm
* Python 3.11
* pip

### 1. Clone the Repository

```bash
git clone https://github.com/shivam-tech241/ai-smart-triage.git
cd ai-smart-triage
```

### 2. Install Node Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create the required environment configuration using the provided example:

```text
backend/.env.example
```

Add the required values to your local environment.

**Do not commit `.env` files, credentials, API keys, or local database files to GitHub.**

### 4. Install Python Dependencies

Install the dependencies required by the AI service according to its Python environment/dependency configuration.

### 5. Start the Application

The project is configured to run the frontend, backend, and AI service together using `concurrently`.

```bash
npm run dev
```

---

## Development

The project includes ESLint for maintaining code quality.

Run the linter using:

```bash
npm run lint
```

Create a production frontend build using:

```bash
npm run build
```

Preview the production build using:

```bash
npm run preview
```

---

## Future Improvements

* Improve the AI model using larger and more diverse datasets.
* Add explainable AI to make predictions easier to understand.
* Add comprehensive unit and integration testing.
* Introduce role-based access control for different hospital staff.
* Add real-time patient queue updates.
* Add automated API testing.
* Containerize the frontend, backend, and AI service.
* Deploy the system using cloud infrastructure.
* Add centralized application logging and monitoring.
* Improve production-level security and privacy controls.
* Add more robust model evaluation and validation.

---

## Disclaimer

This project is an **educational/prototype implementation** demonstrating how AI and full-stack software engineering can be applied to a hospital triage workflow.

It is **not a medical diagnosis or treatment system** and must not be used to make real-world clinical decisions without appropriate medical validation, professional oversight, regulatory compliance, security controls, and privacy safeguards.

---

## Author

**Shivam Kumar Singh**

B.Tech CSE (AI/ML) — Galgotias University

GitHub: [@shivam-tech241](https://github.com/shivam-tech241)

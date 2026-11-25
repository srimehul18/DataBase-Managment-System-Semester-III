# MySociety – Apartment & Society Management System

MySociety is a full-stack Apartment and Society Management System designed to simplify and digitise residential society operations. It provides a centralised platform to manage residents, apartments, maintenance bills, payments, complaints, staff, amenities, bookings, visitors and security records.

The application aims to reduce manual paperwork, improve data management and make everyday society administration more organised and efficient.

## Live Application

- **Frontend:** https://societymanagmentsystem-six.vercel.app/
- **Backend API:** https://dbms-capstone-backend.onrender.com

##  Key Features

- **Apartment Management:** Manage apartment details and residential units.
- **Resident Management:** Maintain resident information and apartment associations.
- **Staff Management:** Maintain staff records and information.
- **Complaint Management:** Register, assign and track resident complaints.
- **Maintenance Management:** Generate and manage maintenance bills.
- **Payment Management:** Record and track maintenance payments.
- **Amenity Management:** Manage society facilities and amenities.
- **Amenity Bookings:** Create and manage amenity reservations.
- **Visitor Management:** Record visitor entry and exit details.
- **Security Logs:** Maintain visitor-related security records.
- **Dashboards:** Provide role-oriented views of society information and operations.

## Technology Stack

### Frontend
- React.js
- Vite
- JavaScript
- Tailwind CSS

### Backend
- Node.js
- Express.js
- REST APIs

### Database
- MySQL 8.4
- Aiven Cloud Database
- MySQL Workbench

### Deployment
- Vercel – Frontend Hosting
- Render – Backend Hosting
- Aiven – Database Hosting
- GitHub – Version Control

## System Architecture

The application follows a three-layer architecture:

1. **Presentation Layer:** React-based frontend responsible for user interaction and displaying information.
2. **Application Layer:** Node.js and Express backend responsible for API handling, validation and business logic.
3. **Database Layer:** MySQL database responsible for storing and managing application data.

The frontend communicates with the backend through REST APIs, while the backend interacts with the MySQL database to perform CRUD operations and execute database procedures.

## Database Design

The MySociety database consists of 12 tables:

| Table | Purpose |
|---|---|
| apartment | Stores apartment information |
| resident | Stores resident details |
| staff | Stores staff information |
| complaint | Manages resident complaints |
| parkingslot | Stores parking slot details |
| vehicle | Maintains vehicle records |
| maintenancebill | Stores maintenance bills |
| payment | Records payment transactions |
| amenity | Stores amenity information |
| amenitybooking | Manages amenity reservations |
| visitor | Stores visitor information |
| securitylog | Maintains security entry and exit records |

### Database Objects

The project also implements:

- **7 Stored Procedures** for reusable database operations.
- **1 Financial View:** `v_maintenance_bill_financials`, used for maintenance financial calculations and payment status information.
- Primary and foreign key relationships for maintaining referential integrity.

### Stored Procedures

| Procedure | Functionality |
|---|---|
| `assign_complaint` | Assigns complaints to staff |
| `check_in_visitor` | Records visitor check-in |
| `check_out_visitor` | Records visitor check-out |
| `create_amenity_booking` | Creates amenity bookings |
| `get_maintenance_summary` | Retrieves maintenance summaries |
| `record_maintenance_payment` | Records maintenance payments |
| `update_complaint_status` | Updates complaint status |

##  Project Modules

The application is organised into the following functional modules:

1. Apartments
2. Residents
3. Staff
4. Complaints
5. Maintenance
6. Payments
7. Amenities
8. Amenity Bookings
9. Visitors
10. Security Logs
11. Parking
12. Dashboards

## Local Installation and Setup

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- MySQL Server or access to a MySQL cloud database
- Git

### 1. Clone the repositories

Clone the frontend and backend repositories separately.

```bash
git clone <frontend-repository-url>
git clone <backend-repository-url>
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file in the backend root directory:

```env
DB_HOST=your_database_host
DB_PORT=your_database_port
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
PORT=5000
```

Configure the database connection and SSL settings according to your MySQL hosting provider.

Start the backend:

```bash
npm start
```

The backend will run on the configured port.

### 3. Frontend Setup

Navigate to the frontend directory:

```bash
cd dbms
npm install
```

Create a `.env.development` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:

```bash
npm run dev
```

### 4. Production Build

To create a production build of the frontend:

```bash
npm run build
```

## API Modules

The backend exposes REST API routes for the following modules:

| Endpoint | Module |
|---|---|
| `/api/residents` | Residents |
| `/api/apartments` | Apartments |
| `/api/complaints` | Complaints |
| `/api/staff` | Staff |
| `/api/amenities` | Amenities |
| `/api/maintenance` | Maintenance |
| `/api/payments` | Payments |
| `/api/amenity-bookings` | Amenity Bookings |
| `/api/visitors` | Visitors |
| `/api/security-logs` | Security Logs |

##  Deployment Architecture

The project is deployed using cloud-based services:

- **Vercel:** Hosts the React frontend.
- **Render:** Hosts the Node.js and Express backend.
- **Aiven:** Hosts the MySQL database.

Environment variables are used to configure the frontend API URL and backend database connection credentials.

##  Security and Data Management

- Database credentials are configured through environment variables.
- Parameterised SQL queries are used for database operations.
- Database relationships maintain referential integrity.
- Database transactions are used for operations requiring multiple related changes.
- Database backups are recommended for data recovery.

##  Future Enhancements

- JWT-based authentication.
- Role-based access control.
- Online payment gateway integration.
- Automated email and notification services.
- Advanced analytics and reporting.
- Mobile application support.

##  Project Objective

The primary objective of MySociety is to demonstrate the practical application of Database Management System concepts through a real-world full-stack application.

It integrates relational database design, SQL queries, joins, stored procedures, views, transactions, CRUD operations, REST APIs and cloud deployment into one functional system.

---

**Project:** MySociety – Apartment & Society Management System  
**Category:** DBMS Capstone Project  
**Database:** MySQL 8.4  
**Architecture:** Full-Stack Web Application  
**Deployment:** Vercel + Render + Aiven

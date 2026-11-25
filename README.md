# MySociety – Apartment and Society Management System

A full-stack web-based Apartment and Society Management System developed as a DBMS Capstone Project. The application provides a centralized platform for managing residents, apartments, staff, complaints, maintenance bills, payments, amenities, bookings, and visitor records.

## Live Deployment

**Live Application:**  
https://societymanagmentsystem-six.vercel.app/

**Backend API:**  
https://dbms-capstone-backend.onrender.com/api

**Frontend Hosting:** Vercel  
**Backend Hosting:** Render  
**Database Hosting:** Aiven MySQL 8.4

---

## 1. Project Overview

Managing an apartment society involves handling multiple activities, including resident information, apartment allocation, maintenance collection, complaint resolution, amenity bookings, and visitor monitoring.

When these activities are maintained manually or across separate records, it can lead to data duplication, inconsistent information, and difficulties in tracking operations.

MySociety aims to simplify these activities through a centralized database-driven web application.

The system connects a React-based frontend with a Node.js and Express backend, which communicates with a MySQL relational database. It allows society-related information to be stored, retrieved, updated, and managed through an interactive interface.

## 2. Objectives

The primary objectives of the project are:

- To design and implement a structured relational database for apartment society management.
- To maintain relationships between different entities using primary keys and foreign keys.
- To reduce data redundancy through database normalization.
- To implement SQL queries, joins, views, and stored procedures.
- To provide a centralized interface for managing society operations.
- To integrate the database with a full-stack web application.
- To deploy the application using cloud-based hosting platforms.

## 3. Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Programming Language | JavaScript |
| Backend | Node.js |
| Backend Framework | Express.js |
| Database | MySQL 8.4 |
| Database Hosting | Aiven |
| Frontend Deployment | Vercel |
| Backend Deployment | Render |
| Version Control | Git and GitHub |

## 4. Major Features and Modules

### 4.1 Apartment Management
- Maintain apartment information.
- Store apartment numbers, blocks, floors, types, and area details.
- Track apartment availability and status.

### 4.2 Resident Management
- Maintain resident information.
- Store names, contact details, email addresses, and resident roles.
- Associate residents with their respective apartments.

### 4.3 Staff Management
- Maintain staff records.
- Store staff details, departments, roles, and contact information.

### 4.4 Complaint Management
- Register and maintain resident complaints.
- Categorize complaints according to their type and priority.
- Track complaint status and assigned staff members.

### 4.5 Maintenance Management
- Generate and maintain monthly maintenance bills.
- Track billing dates, amounts, and payment status.
- Maintain late fee information.

### 4.6 Payment Management
- Store payment transactions.
- Maintain payment amounts, dates, methods, and reference numbers.
- Track successful payment records.

### 4.7 Amenity Management
- Maintain society amenity information.
- Store amenity capacity, location, and booking fees.
- Manage amenity booking records.

### 4.8 Visitor Management
- Maintain visitor details and their purpose of visit.
- Record visitor entry and exit information.
- Associate visitors with residents.

### 4.9 Security Management
- Maintain visitor security logs.
- Record entry and exit details.
- Associate security records with the responsible staff members.

## 5. Database Design

The project uses a relational database developed using MySQL 8.4.

The database contains the following ten core tables:

| Table Name | Description |
|---|---|
| apartment | Stores apartment details |
| resident | Stores resident information |
| staff | Stores staff details |
| complaint | Maintains resident complaints |
| maintenancebill | Stores maintenance billing records |
| payment | Maintains payment transactions |
| amenity | Stores available amenities |
| amenitybooking | Maintains amenity bookings |
| visitor | Stores visitor information |
| securitylog | Maintains visitor security records |

### Database Concepts Implemented

The following DBMS concepts were incorporated:

- Entity Relationship Modelling
- Relational Schema Design
- Primary Key and Foreign Key Constraints
- Database Normalization (1NF, 2NF and 3NF)
- SQL DDL and DML Operations
- Joins and Aggregate Functions
- Database Views
- Stored Procedures
- Transactions using COMMIT and ROLLBACK
- Data Integrity Constraints

### Database View

The project includes a view named `v_maintenance_bill_financials`, which provides a consolidated financial summary of maintenance bills.

It calculates information such as:

- Total amount due
- Total amount paid
- Outstanding balance
- Overpayment amount
- Effective payment status
- Late fee

### Stored Procedures

The database implements the following stored procedures:

1. `assign_complaint`
2. `check_in_visitor`
3. `check_out_visitor`
4. `create_amenity_booking`
5. `get_maintenance_summary`
6. `record_maintenance_payment`
7. `update_complaint_status`

These procedures help perform commonly required database operations in a structured manner.

## 6. System Architecture

MySociety follows a three-layer application architecture.

### Presentation Layer
The frontend is developed using React and Vite, with Tailwind CSS for styling. It provides the user interface through which society information and management operations can be accessed.

### Application Layer
The backend is developed using Node.js and Express.js. It handles incoming API requests, processes application logic, performs validations, and communicates with the database.

### Database Layer
MySQL 8.4 stores the application data in relational tables. The backend executes SQL operations to retrieve and modify the required information.

### Data Flow

```text
        USER
          |
          v
   REACT FRONTEND
       (Vercel)
          |
          | REST API Requests
          v
   NODE.JS + EXPRESS
       (Render)
          |
          | SQL Queries
          v
      MYSQL 8.4
        (Aiven)
          |
          v
     DATABASE
     OPERATIONS
```

## 7. API Endpoints

The backend exposes REST API endpoints for the major application modules.

**Base URL:**

`https://dbms-capstone-backend.onrender.com/api`

| Endpoint | Purpose |
|---|---|
| `/residents` | Resident operations |
| `/apartments` | Apartment operations |
| `/complaints` | Complaint operations |
| `/staff` | Staff operations |
| `/amenities` | Amenity operations |
| `/maintenance` | Maintenance operations |
| `/payments` | Payment operations |
| `/amenity-bookings` | Amenity booking operations |
| `/visitors` | Visitor operations |
| `/security-logs` | Security log operations |

The API supports the application's data management operations through HTTP requests.

## 8. Deployment

The application is deployed using three cloud platforms.

### Frontend – Vercel
The React frontend is hosted on Vercel, making the application accessible through a public URL.

### Backend – Render
The Node.js and Express backend is hosted on Render. It processes API requests and communicates with the MySQL database.

### Database – Aiven
The MySQL 8.4 database is hosted on Aiven, providing the database service used by the application.

### Deployment Links

- **Live Application:** https://societymanagmentsystem-six.vercel.app/
- **Backend API:** https://dbms-capstone-backend.onrender.com/api

## 9. Installation and Local Setup

To run the project locally, follow these steps.

### Prerequisites

Install the following:

- Node.js and npm
- Git
- MySQL-compatible database access
- Code editor such as Visual Studio Code

### Step 1: Clone the Repositories

Clone the frontend and backend repositories separately using their respective GitHub URLs.

```bash
git clone <frontend-repository-url>
git clone <backend-repository-url>
```

### Step 2: Install Frontend Dependencies

Navigate to the frontend project directory and run:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

### Step 3: Install Backend Dependencies

Navigate to the backend project directory and run:

```bash
npm install
```

Configure the required environment variables in the backend `.env` file.

Typical database configuration values include:

```env
DB_HOST=your_database_host
DB_PORT=your_database_port
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
PORT=3000
```

Use the actual environment variable names expected by the backend source code.

Start the backend server:

```bash
npm start
```

### Step 4: Database Configuration

Configure the MySQL database connection using the appropriate credentials.

Ensure that the required tables, relationships, views, stored procedures, and sample records are available before running the application.

**Important:** Never commit database passwords, private connection strings, or other sensitive credentials to GitHub.

## 10. Testing and Validation

The application was tested to verify the functionality of its major modules and the communication between the frontend, backend, and database.

The following operations were tested:

- Retrieving apartment and resident records.
- Adding and updating resident information.
- Managing complaints and their status.
- Retrieving maintenance bills and payment records.
- Managing amenity bookings.
- Recording visitor entry and exit information.
- Verifying database relationships and constraints.
- Testing stored procedures and transaction operations.

The deployed application was also checked to ensure that API requests and database operations function correctly.

## 11. Future Enhancements

The project can be extended with additional features, including:

- Secure user authentication and role-based access control.
- Online maintenance payment integration.
- Automated maintenance bill notifications.
- Email and SMS notifications for complaints and visitors.
- Advanced financial reports and analytics.
- Improved administrative dashboards.
- Mobile application support.

## 12. Conclusion

MySociety demonstrates the practical implementation of Database Management System concepts through a full-stack web application.

The project combines relational database design, SQL operations, stored procedures, views, transaction management, and data integrity constraints with modern frontend and backend technologies.

By providing a centralized platform for apartment and society management, the application demonstrates how database-driven systems can simplify everyday administrative activities.

The successful integration and deployment of the frontend, backend, and MySQL database provide a working foundation for further development and enhancement.

---

## Project Information

**Project Name:** MySociety – Apartment and Society Management System

**Project Type:** DBMS Capstone Project

**Database:** MySQL 8.4

**Frontend:** React.js and Vite

**Backend:** Node.js and Express.js

**Deployment:** Vercel, Render and Aiven

**Live Project:** https://societymanagmentsystem-six.vercel.app/

## Other Things
This Repo also contains all the Lab Work done from Lab 1 to Lab 4 and Assignments

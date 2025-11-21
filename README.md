# 🧪 Clinical Trial and Research Hub

## Project Overview

The **Clinical Trial and Research Hub** is a robust database application designed to manage the complex, high-volume data generated during multi-phase clinical trials. It serves as the central data repository for tracking patient enrollment, scheduling visits, logging clinical measurements, and generating analytical insights crucial for trial efficacy and safety reviews.

The system employs **Polyglot Persistence**, leveraging **MySQL** for structured, transactional data integrity (the core of this project) and conceptually integrating a NoSQL solution (like MongoDB) for unstructured text data (protocol documents and verbose adverse event narratives).

---

## 📋 User Requirement Specification (URS)

The application is built to support key user roles (Study Coordinator, Data Analyst) by fulfilling the following core functionalities:

| ID | Functionality | Description | Associated SQL |
| :---: | :--- | :--- | :--- |
| **R1** | **Patient Enrollment & CRUD** | Interface to register new patients (`CREATE`) and manage demographics (`UPDATE`/`DELETE`). | `INSERT INTO Patients, UPDATE Contact_Info` |
| **R2** | **Visit Scheduling Automation** | Automatically generates all mandatory follow-up visits upon initial enrollment. | **Stored Procedure** (`proc_auto_schedule_visits`) |
| **R3** | **Trial Efficacy Analysis** | Calculates the overall percentage of patients achieving a positive outcome (e.g., 'Responded'). | **Stored Function** (`GetResponseRate`) |
| **R4** | **Data Integrity Lock** | Prevents modification of clinical measurements or medication once a visit is officially marked as 'Completed'. | **Trigger** (`trg_update_measurements_check`) |
| **R5** | **Full Patient History** | Generates a chronological, multi-table report of all events (visits, measurements, medication) for a single patient. | **Complex JOIN Query** |
| **R6** | **Compliance Check** | Identifies enrolled patients who have missed or not completed their critical baseline visit (`Visit 1`). | **Nested Query** |
| **R7** | **System Health Dashboard** | Displays high-level aggregated metrics like Total Patients and Average Response Rate. | **Aggregate Query** (`COUNT`, `AVG`) |

---

## 🗄️ Database Schema (MySQL)

The database is built using 13 entities, ensuring **Third Normal Form (3NF)** compliance.

| Table Name | Description | Primary Key | Key Foreign Keys |
| :--- | :--- | :--- | :--- |
| **Patients** | Patient demographics. | `patient_id` | `contact_id` (FK, Unique) |
| **Staff** | Investigators and coordinators. | `staff_id` | - |
| **Contact_Info** | Contact details (email, phone, address). | `contact_id` | - |
| **Clinical_Trials** | Defines each study. | `trial_id` | `sponsor_id`, `primary_investigator_id` |
| **Research_Sites** | Where the trial is conducted. | `site_id` | `site_director_id` |
| **Patient_Enrollment** | Junction table linking patient, trial, and site. | `enrollment_id` | `patient_id`, `trial_id`, `site_id` |
| **Visits** | Scheduling and status of appointments. | `visit_id` | `enrollment_id` |
| **Measurements** | Numerical data collected (BP, T-Cell Count, etc.). | `measurement_id` | `visit_id` |
| **Trial_Medication_Dispense** | Logs drug/placebo given at a visit. | `dispense_id` | `visit_id`, `medication_id` |
| **Medication** | List of all drugs/placebos used. | `medication_id` | - |
| **Trial_Outcomes** | Final efficacy/safety conclusions per visit. | `outcome_id` | `visit_id` |
| **Sponsors** | Funding organizations. | `sponsor_id` | - |
| **Adverse_Events** | Records side effects or issues. | `event_id` | `enrollment_id` |

---

## ⚙️ Advanced SQL Components

The following components enable the system's core business logic and analysis:

### 1. Procedures and Functions

| Component | Type | Code Snippet (Invocation) | Logic Summary |
| :--- | :--- | :--- | :--- |
| **`GetResponseRate`** | **Function** | `SELECT fn_get_response_rate(1);` | Calculates (Count Responders / Total Enrolled) * 100 using complex JOINs and conditional counting. |
| **`proc_auto_schedule_visits`** | **Procedure** | `CALL proc_auto_schedule_visits(5, '2025-06-01', 4, 30);` | Automates `INSERT`ing 4 follow-up visit records into the `Visits` table, 30 days apart. |

### 2. Triggers (Data Integrity and Audit)

| Component | Action | Table | Logic Summary |
| :--- | :--- | :--- | :--- |
| **`prevent_completed_visit_update`** | `BEFORE UPDATE` | `Visits` | Blocks any update attempt if `OLD.status` is 'Completed'. **Critical for audit trail.** |
| **`prevent_medication_change`** | `BEFORE UPDATE` | `Trial_Medication_Dispense` | Blocks changing the `medication_id` after the record has been created, preventing accidental unblinding of the study drug. |

### 3. Complex Queries

| Query Type | Functionality | Key SQL Concept | Description |
| :--- | :--- | :--- | :--- |
| **JOIN Query** | **Full Patient History** | `JOIN`s across 6+ tables | Links **Patient** $\rightarrow$ **Enrollment** $\rightarrow$ **Visits** $\rightarrow$ **Measurements** $\rightarrow$ **Medication** for a single, comprehensive timeline view. |
| **NESTED Query** | **High Responder Check** | `WHERE value > (SELECT AVG(value)...)` | Identifies patients whose specific measurement (`Antibody Level`) is significantly above the average of all patients in the study. |
| **AGGREGATE Query** | **Dashboard Metrics** | `COUNT()`, `SUM(CASE WHEN...)`, `AVG()` | Provides the total number of patients, completed visits, and the average efficacy metrics for the system health dashboard. |

---

## 📂 Deliverables

The following files are included in this repository:

1.  **`README.md`** (This file)
2.  **`clinical_trial_and_research.sql`**: Contains all DDL (`CREATE TABLE`), DML (`INSERT`), Triggers, Procedures, Functions, and Complex Queries.
   
    [View the Complete SQL Database File](clinical_trial_and_research.sql)
4.  **`ER_Diagram.png`**: The complete Entity-Relationship Diagram.

   <img width="2061" height="2204" alt="updated ER" src="https://github.com/user-attachments/assets/ff9de5d7-8916-4cde-8a88-868ae25c2dcc" />

6.  **`GUI_Screenshots/`**: Folder containing screenshots of CRUD operations and advanced feature demonstrations (e.g., response rate widget, trigger error messages).

[View All Project Screenshots (CRUD, Triggers, Reports)](GUI_Screenshots/)

---

## Authors
1. Nishita Singh (ohnonyx)
2. Nithya Prashaanthi R. (nithya-1385)

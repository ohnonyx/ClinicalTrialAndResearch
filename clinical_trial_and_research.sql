DELIMITER $$

-- 1.1 Contact_Info Table
CREATE TABLE Contact_Info (
    contact_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    address VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20)
);

INSERT INTO Contact_Info (contact_id, email, phone_number, address, city, zip_code) VALUES
(1, 'elara@mail.com', '555-0101', '45 Oak Lane', 'Boston', '02108'),
(2, 'smith.j@mail.com', '555-0404', '22 Pine St', 'Boston', '02110'),
(3, 'dr.aris@clinic.org', '555-0606', '100 Research Blvd', 'Boston', '02118'),
(4, 'coordinator@bwh.edu', '555-0505', '75 Francis St', 'Boston', '02115');

-- Additional contacts
INSERT INTO Contact_Info (email, phone_number, address, city, zip_code) VALUES
('aiden.miller@mail.com', '555-1001', '12 River St', 'Boston', '02116'),
('nora.hill@mail.com', '555-1002', '78 Maple Ave', 'Cambridge', '02139'),
('luke.ross@mail.com', '555-1003', '33 Beacon St', 'Boston', '02108'),
('olivia.patel@mail.com', '555-1004', '90 Elm Rd', 'Cambridge', '02140'),
('dylan.brooks@mail.com', '555-1005', '17 Walnut St', 'Boston', '02109'),
('mia.khan@mail.com', '555-1006', '56 Birch Ave', 'Boston', '02111'),
('sophia.gray@mail.com', '555-1007', '29 Willow St', 'Boston', '02118'),
('noah.diaz@mail.com', '555-1008', '41 Spruce Ln', 'Cambridge', '02142'),
('ava.cole@mail.com', '555-1009', '8 Cherry Ct', 'Boston', '02113'),
('leo.wright@mail.com', '555-1010', '64 Aspen St', 'Boston', '02114'),
('ella.reed@mail.com', '555-1011', '19 Bay St', 'Boston', '02116'),
('henry.adams@mail.com', '555-1012', '21 Harbor Way', 'Cambridge', '02141'),
('layla.hughes@mail.com', '555-1013', '7 Blossom Rd', 'Boston', '02115');

-- 1.2 Staff Table
CREATE TABLE Staff (
    staff_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role VARCHAR(50) NOT NULL
);

INSERT INTO Staff (staff_id, first_name, last_name, role) VALUES
(1, 'Dr. Aris', 'Thorne', 'Primary Investigator'),
(2, 'Dr. Lena', 'Hale', 'Co-Investigator'),
(3, 'Mark', 'Owen', 'Study Coordinator'),
(4, 'Evelyn', 'Reed', 'Data Analyst');

-- 1.3 Patients Table
CREATE TABLE Patients (
    patient_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    contact_id INT UNIQUE NOT NULL,
    FOREIGN KEY (contact_id) REFERENCES Contact_Info(contact_id)
);

INSERT INTO Patients (patient_id, first_name, last_name, date_of_birth, gender, contact_id) VALUES
(1, 'Elara', 'Vance', '1985-05-15', 'Female', 1),
(2, 'Jason', 'Smith', '1970-11-20', 'Male', 2);

-- Additional patients
INSERT INTO Patients (first_name, last_name, date_of_birth, gender, contact_id) VALUES
('Aiden', 'Miller', '1982-03-12', 'Male', 5),
('Nora', 'Hill', '1990-07-23', 'Female', 6),
('Luke', 'Ross', '1978-10-10', 'Male', 7),
('Olivia', 'Patel', '1985-09-02', 'Female', 8),
('Dylan', 'Brooks', '1992-04-15', 'Male', 9),
('Mia', 'Khan', '1988-12-09', 'Female', 10),
('Sophia', 'Gray', '1976-08-21', 'Female', 11),
('Noah', 'Diaz', '1983-06-05', 'Male', 12),
('Ava', 'Cole', '1995-11-30', 'Female', 13),
('Leo', 'Wright', '1980-01-18', 'Male', 14),
('Ella', 'Reed', '1979-02-22', 'Female', 15),
('Henry', 'Adams', '1984-10-12', 'Male', 16),
('Layla', 'Hughes', '1991-05-27', 'Female', 17);

-- 1.4 Sponsors Table
CREATE TABLE Sponsors (
    sponsor_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) UNIQUE NOT NULL,
    contact_person VARCHAR(100)
);

INSERT INTO Sponsors (sponsor_id, name, contact_person) VALUES
(1, 'Global BioPharm', 'Dr. Alistair Finch'),
(2, 'Research Grant Foundation', 'Dr. Clara Jones');

-- 1.5 Research_Sites Table
CREATE TABLE Research_Sites (
    site_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    street_address VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    site_director_id INT NOT NULL,
    FOREIGN KEY (site_director_id) REFERENCES Staff(staff_id)
);

INSERT INTO Research_Sites (site_id, name, street_address, city, site_director_id) VALUES
(1, 'Boston Trial Center', '123 Healthway', 'Boston', 1);

-- 1.6 Medication Table
CREATE TABLE Medication (
    medication_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    manufacturer VARCHAR(100)
);

INSERT INTO Medication (medication_id, name, manufacturer) VALUES
(1, 'Drug X (Active)', 'Global BioPharm'),
(2, 'Placebo', 'Generic Labs'),
(3, 'Drug Y', 'BioLabs'),
(4, 'Drug Z', 'HealthCo');

-- 2. TRIAL AND PROTOCOL MANAGEMENT

-- 2.1 Clinical_Trials
CREATE TABLE Clinical_Trials (
    trial_id INT PRIMARY KEY AUTO_INCREMENT,
    trial_name VARCHAR(255) UNIQUE NOT NULL,
    phase ENUM('I', 'II', 'III', 'IV') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description TEXT,
    sponsor_id INT NOT NULL,
    primary_investigator_id INT NOT NULL,
    FOREIGN KEY (sponsor_id) REFERENCES Sponsors(sponsor_id),
    FOREIGN KEY (primary_investigator_id) REFERENCES Staff(staff_id)
);

INSERT INTO Clinical_Trials (trial_id, trial_name, phase, start_date, end_date, description, sponsor_id, primary_investigator_id) VALUES
(1, 'Drug X Efficacy Study', 'III', '2025-01-01', '2026-01-01', 'Phase III study for Condition Alpha.', 1, 1),
(2, 'Condition Beta Immuno Study', 'II', '2025-02-01', '2026-02-01', 'Phase II study on immune response to Drug Y.', 2, 2);

-- 3. PATIENT JOURNEY AND DATA COLLECTION

-- 3.1 Patient_Enrollment
CREATE TABLE Patient_Enrollment (
    enrollment_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    trial_id INT NOT NULL,
    site_id INT NOT NULL,
    enrollment_date DATE NOT NULL,
    status ENUM('Screened', 'Enrolled', 'Withdrawn', 'Completed') NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id),
    FOREIGN KEY (trial_id) REFERENCES Clinical_Trials(trial_id),
    FOREIGN KEY (site_id) REFERENCES Research_Sites(site_id),
    UNIQUE (patient_id, trial_id)
);

INSERT INTO Patient_Enrollment (enrollment_id, patient_id, trial_id, site_id, enrollment_date, status) VALUES
(1, 1, 1, 1, '2025-01-10', 'Enrolled'),
(2, 2, 1, 1, '2025-01-15', 'Enrolled'),
(3, 3, 1, 1, '2025-01-20', 'Enrolled'),
(4, 4, 1, 1, '2025-01-25', 'Enrolled'),
(5, 5, 1, 1, '2025-01-28', 'Enrolled'),
(6, 6, 1, 1, '2025-02-02', 'Enrolled'),
(7, 7, 1, 1, '2025-02-05', 'Enrolled'),
(8, 8, 2, 1, '2025-02-10', 'Enrolled'),
(9, 9, 2, 1, '2025-02-12', 'Enrolled'),
(10, 10, 2, 1, '2025-02-15', 'Enrolled'),
(11, 11, 2, 1, '2025-02-18', 'Enrolled'),
(12, 12, 2, 1, '2025-02-22', 'Enrolled'),
(13, 13, 2, 1, '2025-02-25', 'Enrolled'),
(14, 14, 1, 1, '2025-03-01', 'Enrolled'),
(15, 15, 1, 1, '2025-03-03', 'Enrolled');

-- 3.2 Visits
CREATE TABLE Visits (
    visit_id INT PRIMARY KEY AUTO_INCREMENT,
    enrollment_id INT NOT NULL,
    visit_number INT NOT NULL,
    scheduled_date DATE NOT NULL,
    actual_date DATE,
    status ENUM('Scheduled', 'Rescheduled', 'Missed', 'Completed') NOT NULL,
    notes TEXT,
    FOREIGN KEY (enrollment_id) REFERENCES Patient_Enrollment(enrollment_id),
    UNIQUE (enrollment_id, visit_number)
);

INSERT INTO Visits (visit_id, enrollment_id, visit_number, scheduled_date, actual_date, status, notes) VALUES
(101, 1, 1, '2025-01-15', '2025-01-15', 'Completed', 'Baseline checkup.'),
(102, 1, 2, '2025-02-15', '2025-02-15', 'Completed', 'First follow-up.'),
(103, 2, 1, '2025-01-20', '2025-01-20', 'Completed', 'Baseline checkup.'),
(104, 2, 2, '2025-02-20', NULL, 'Scheduled', 'Second follow-up scheduled.'),
(105, 3, 1, '2025-01-25', '2025-01-25', 'Completed', 'Baseline assessment.'),
(106, 3, 2, '2025-02-25', '2025-02-26', 'Completed', 'Stable BP, mild improvement.'),
(107, 3, 3, '2025-03-25', NULL, 'Scheduled', 'Follow-up scheduled.'),
(108, 4, 1, '2025-01-30', '2025-01-30', 'Completed', 'Initial screening.'),
(109, 4, 2, '2025-02-28', '2025-02-28', 'Completed', 'BP reduced 5%.'),
(110, 4, 3, '2025-03-30', NULL, 'Scheduled', 'Awaiting checkup.'),
(111, 5, 1, '2025-02-01', '2025-02-01', 'Completed', 'Baseline visit.'),
(112, 5, 2, '2025-03-01', '2025-03-01', 'Completed', 'BP normal range.'),
(113, 5, 3, '2025-04-01', NULL, 'Scheduled', 'End of trial visit.'),
(114, 6, 1, '2025-02-05', '2025-02-05', 'Completed', 'Baseline.'),
(115, 6, 2, '2025-03-05', NULL, 'Scheduled', 'Upcoming follow-up.'),
(116, 7, 1, '2025-02-10', '2025-02-10', 'Completed', 'Baseline.'),
(117, 7, 2, '2025-03-10', '2025-03-11', 'Completed', 'Stable.'),
(118, 7, 3, '2025-04-10', NULL, 'Scheduled', 'Final check.'),
(119, 8, 1, '2025-02-15', '2025-02-15', 'Completed', 'Baseline immune profile.'),
(120, 8, 2, '2025-03-15', '2025-03-16', 'Completed', 'Improved T-cell count.'),
(121, 8, 3, '2025-04-15', NULL, 'Scheduled', 'Pending lab review.'),
(122, 9, 1, '2025-02-18', '2025-02-18', 'Completed', 'Baseline immune.'),
(123, 9, 2, '2025-03-18', '2025-03-19', 'Completed', 'Moderate immune increase.'),
(124, 9, 3, '2025-04-18', NULL, 'Scheduled', 'Next visit scheduled.'),
(125, 10, 1, '2025-02-20', '2025-02-20', 'Completed', 'Baseline assessment.'),
(126, 10, 2, '2025-03-20', '2025-03-20', 'Completed', 'Stable immune markers.'),
(127, 11, 1, '2025-02-22', '2025-02-22', 'Completed', 'Baseline done.'),
(128, 11, 2, '2025-03-22', '2025-03-23', 'Completed', 'Slight side effects reported.'),
(129, 12, 1, '2025-02-25', '2025-02-25', 'Completed', 'Initial test complete.'),
(130, 12, 2, '2025-03-25', '2025-03-25', 'Completed', 'Increased antibody levels.'),
(131, 13, 1, '2025-02-28', '2025-02-28', 'Completed', 'Baseline.'),
(132, 13, 2, '2025-03-28', NULL, 'Scheduled', 'Follow-up scheduled.'),
(133, 14, 1, '2025-03-05', '2025-03-05', 'Completed', 'Trial entry.'),
(134, 14, 2, '2025-04-05', NULL, 'Scheduled', 'Pending next visit.'),
(135, 15, 1, '2025-03-07', '2025-03-07', 'Completed', 'Baseline metrics.'),
(136, 15, 2, '2025-04-07', NULL, 'Scheduled', 'Next checkup due.');

-- 3.3 Measurements
CREATE TABLE Measurements (
    measurement_id INT PRIMARY KEY AUTO_INCREMENT,
    visit_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    value DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(10) NOT NULL,
    timestamp DATETIME NOT NULL,
    FOREIGN KEY (visit_id) REFERENCES Visits(visit_id)
);

INSERT INTO Measurements (measurement_id, visit_id, type, value, unit, timestamp) VALUES
(1001, 101, 'Systolic BP', 135.0, 'mmHg', '2025-01-15 09:00:00'),
(1002, 101, 'Diastolic BP', 88.0, 'mmHg', '2025-01-15 09:00:00'),
(1003, 102, 'Systolic BP', 128.0, 'mmHg', '2025-02-15 09:30:00'),
(1004, 102, 'Diastolic BP', 84.0, 'mmHg', '2025-02-15 09:30:00'),
(1005, 105, 'Systolic BP', 140.0, 'mmHg', '2025-01-25 10:00:00'),
(1006, 106, 'Systolic BP', 132.0, 'mmHg', '2025-02-26 10:00:00'),
(1007, 119, 'T-Cell Count', 520.0, 'cells/uL', '2025-02-15 11:00:00'),
(1008, 120, 'T-Cell Count', 600.0, 'cells/uL', '2025-03-16 11:15:00'),
(1009, 127, 'Antibody Level', 1.2, 'mg/mL', '2025-02-22 11:30:00'),
(1010, 128, 'Antibody Level', 1.5, 'mg/mL', '2025-03-23 11:45:00');

-- 3.4 Trial_Medication_Dispense Table (Junction: Visits <-> Medication)

CREATE TABLE Trial_Medication_Dispense (
    dispense_id INT PRIMARY KEY AUTO_INCREMENT,
    visit_id INT NOT NULL,
    medication_id INT NOT NULL,
    quantity_dispensed INT NOT NULL,
    dosage_instructions TEXT NOT NULL,
    FOREIGN KEY (visit_id) REFERENCES Visits(visit_id),
    FOREIGN KEY (medication_id) REFERENCES Medication(medication_id)
);

INSERT INTO Trial_Medication_Dispense (dispense_id, visit_id, medication_id, quantity_dispensed, dosage_instructions) VALUES
(1, 101, 1, 30, 'Take 1 pill daily.'),
(2, 102, 1, 30, 'Take 1 pill daily.'),
(3, 105, 2, 30, 'Take 1 pill daily.'),
(4, 106, 2, 30, 'Take 1 pill daily.'),
(5, 119, 3, 30, 'Take 1 pill daily after meals.'),
(6, 120, 3, 30, 'Take 1 pill daily after meals.'),
(7, 127, 4, 30, 'Take 1 pill every morning.'),
(8, 128, 4, 30, 'Take 1 pill every morning.');

-- 3.5 Trial_Outcomes Table (Links to Visits)

CREATE TABLE Trial_Outcomes (
    outcome_id INT PRIMARY KEY AUTO_INCREMENT,
    visit_id INT NOT NULL,
    outcome_type VARCHAR(100) NOT NULL,
    outcome_value TEXT NOT NULL,
    notes TEXT,
    FOREIGN KEY (visit_id) REFERENCES Visits(visit_id)
);

INSERT INTO Trial_Outcomes (outcome_id, visit_id, outcome_type, outcome_value, notes) VALUES
(1, 102, 'Primary Efficacy', 'Responded', '7% reduction in Systolic BP from baseline.'),
(2, 103, 'Safety Review', 'Stable', 'No issues post-baseline.'),
(3, 106, 'Primary Efficacy', 'Improved', '5 mmHg reduction observed.'),
(4, 107, 'Safety Review', 'No adverse events', 'Patient tolerated medication well.'),
(5, 120, 'Immunogenic Response', 'Positive', 'T-cell count increased by 15%.'),
(6, 122, 'Immunogenic Response', 'Stable', 'No change in antibody levels.'),
(7, 128, 'Efficacy', 'High Response', 'Significant antibody increase noted.');


DELIMITER $$
-- Function
DELIMITER //

CREATE FUNCTION fn_get_response_rate (trialID INT)
RETURNS DECIMAL(5, 2)
READS SQL DATA
BEGIN
    DECLARE total_enrolled INT;
    DECLARE total_responders INT;
    DECLARE response_percentage DECIMAL(5, 2);

    SELECT COUNT(enrollment_id)
    INTO total_enrolled
    FROM Patient_Enrollment
    WHERE trial_id = trialID;

    SELECT COUNT(DISTINCT T1.enrollment_id)
    INTO total_responders
    FROM Patient_Enrollment AS T1
    JOIN Visits AS T2 ON T1.enrollment_id = T2.enrollment_id
    JOIN Trial_Outcomes AS T3 ON T2.visit_id = T3.visit_id
    WHERE T1.trial_id = trialID
      AND T3.outcome_value IN ('Responded', 'Positive', 'High Response', 'Improved');

    IF total_enrolled > 0 THEN
        SET response_percentage = (total_responders * 100.0) / total_enrolled;
    ELSE
        SET response_percentage = 0.00;
    END IF;

    RETURN response_percentage;
END //

DELIMITER ;

-- Procedure
DELIMITER //

CREATE PROCEDURE proc_auto_schedule_visits (
    IN enrollmentID INT,
    IN starting_date DATE,
    IN num_visits INT,
    IN interval_days INT
)
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE next_scheduled_date DATE;

    SET next_scheduled_date = DATE_ADD(starting_date, INTERVAL interval_days DAY);

    WHILE i <= num_visits DO
        INSERT INTO Visits (enrollment_id, visit_number, scheduled_date, actual_date, status, notes) VALUES
        (enrollmentID, i + 1, next_scheduled_date, NULL, 'Scheduled', CONCAT('Auto-scheduled follow-up visit #', i + 1, ' (', interval_days, ' day interval)'));

        SET next_scheduled_date = DATE_ADD(next_scheduled_date, INTERVAL interval_days DAY);
        SET i = i + 1;
    END WHILE;
END //

DELIMITER ;


-- Trigger
DELIMITER $$

CREATE TRIGGER prevent_completed_visit_update
BEFORE UPDATE ON Visits
FOR EACH ROW
BEGIN
  IF OLD.status = 'Completed' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot modify a completed visit.';
  END IF;
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER prevent_medication_change
BEFORE UPDATE ON Trial_Medication_Dispense
FOR EACH ROW
BEGIN
  IF OLD.medication_id <> NEW.medication_id THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot change medication once dispensed.';
  END IF;
END$$

DELIMITER ;

-- nested query
SELECT 
  p.first_name, p.last_name, m.value AS antibody_level
FROM Measurements m
JOIN Visits v ON m.visit_id = v.visit_id
JOIN Patient_Enrollment e ON v.enrollment_id = e.enrollment_id
JOIN Patients p ON e.patient_id = p.patient_id
WHERE m.type = 'Antibody Level'
AND m.value > (
  SELECT AVG(value) FROM Measurements WHERE type = 'Antibody Level'
);

-- join
SELECT 
  p.patient_id,
  CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
  t.trial_name,
  v.visit_number,
  v.status AS visit_status,
  o.outcome_value,
  m.name AS medication_name,
  d.quantity_dispensed,
  d.dosage_instructions
FROM Patients p
JOIN Patient_Enrollment e ON p.patient_id = e.patient_id
JOIN Clinical_Trials t ON e.trial_id = t.trial_id
JOIN Visits v ON e.enrollment_id = v.enrollment_id
LEFT JOIN Trial_Outcomes o ON v.visit_id = o.visit_id
LEFT JOIN Trial_Medication_Dispense d ON v.visit_id = d.visit_id
LEFT JOIN Medication m ON d.medication_id = m.medication_id
ORDER BY p.patient_id, v.visit_number;

-- aggregate
SELECT 
  COUNT(DISTINCT p.patient_id) AS total_patients,
  COUNT(DISTINCT t.trial_id) AS total_trials,
  COUNT(DISTINCT v.visit_id) AS total_visits,
  SUM(CASE WHEN v.status = 'Completed' THEN 1 ELSE 0 END) AS completed_visits,
  ROUND(
    COUNT(DISTINCT CASE WHEN o.outcome_value IN ('Improved', 'Responded', 'Positive', 'High Response') THEN e.patient_id END)
    / COUNT(DISTINCT e.patient_id) * 100, 2
  ) AS avg_response_rate
FROM Patients p
JOIN Patient_Enrollment e ON p.patient_id = e.patient_id
JOIN Clinical_Trials t ON e.trial_id = t.trial_id
LEFT JOIN Visits v ON e.enrollment_id = v.enrollment_id
LEFT JOIN Trial_Outcomes o ON v.visit_id = o.visit_id;

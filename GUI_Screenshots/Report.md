# Clinical Trial Data Management and Research System

Team:
Nishita Singh - PES1UG23CS403

Nithya Prashaanthi R. - PES1UG23CS406

## Project Abstract:
This system provides a structured relational database solution for managing the logistics and data collection of clinical trials. It tracks core entities like Patients, Staff, Clinical Trials (phases I-IV), and Sponsors. Key functionalities include managing patient enrollment and tracking detailed visits, which capture critical measurements (e.g., BP, T-Cell Count) and trial outcomes.

User Requirement Specification (URS):

Data Integrity - Must store patient data (DOB, gender), contact details (1:1 relationship via Contact_Info), and staff roles.

Trial Tracking - Manage trial name, phase, start/end dates, sponsor, and Primary Investigator.

Workflow Management - Track patient status through the trial lifecycle: Screened, Enrolled, Withdrawn, Completed.

Visit Logistics - Record visit details: scheduled/actual dates, status (Scheduled, Completed, Missed).

Data Collection - Record quantitative Measurements (value/unit) and qualitative Trial_Outcomes (e.g., 'Responded', 'Positive') per visit.

Security/Rules - Enforce business rules using triggers (e.g., preventing updates to completed visits).

## Tables Implemented in 3NF:

Contact_Info

Patient_Enrollment

Staff

Visits

Patients

Measurements

Sponsors

Trial_Medication_Dispense

Research_Sites

Trial_Outcomes

Clinical_Trials

Medication


## Functions
GetResponseRate: 

Calculates the percentage of unique patients in a specific trialId who have a recorded positive Trial_Outcomes value ('Improved', 'Responded', 'Positive', 'High Response').
EXAMPLE:
```
DELIMITER $$

CREATE PROCEDURE GetResponseRate(IN trialId INT)
BEGIN
  SELECT 
    t.trial_name,
    COUNT(DISTINCT CASE WHEN o.outcome_value IN ('Improved', 'Responded', 'Positive', 'High Response') THEN e.patient_id END)
      / COUNT(DISTINCT e.patient_id) * 100 AS response_rate_percentage
  FROM Clinical_Trials t
  JOIN Patient_Enrollment e ON t.trial_id = e.trial_id
  LEFT JOIN Visits v ON e.enrollment_id = v.enrollment_id
  LEFT JOIN Trial_Outcomes o ON v.visit_id = o.visit_id
  WHERE t.trial_id = trialId
  GROUP BY t.trial_id;
END$$

DELIMITER ;
```

## Triggers:
prevent_completed_visit_update:
BEFORE UPDATE on Visits. Prevents any modification to a visit record if its status is 'Completed'. EXAMPLE:
```
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
```

## Join Query:
Retrieves a detailed patient-centric report, joining Patients, Enrollment, Trials, Visits, Outcomes, and Medication tables. EXAMPLE:
```
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
```

## Aggregate Query:
Calculates system-wide metrics: total patients, total trials, total visits, completed visits, and the overall average response rate. EXAMPLE:
```
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
```

## Nested Query:
Uses an inner subquery to find all staff_id values present in the Research_Sites table's site_director_id column. The outer query then retrieves the name of the staff member corresponding to those IDs. EXAMPLE:

```
SELECT
    P.first_name,
    P.last_name,
    T1.avg_systolic_bp
FROM Patients P
JOIN Patient_Enrollment E ON P.patient_id = E.patient_id
JOIN (
    -- Inner Query (Subquery / Inline View) calculates average BP
    SELECT
        E.patient_id,
        AVG(M.value) AS avg_systolic_bp
    FROM Measurements M
    JOIN Visits V ON M.visit_id = V.visit_id
    JOIN Patient_Enrollment E ON V.enrollment_id = E.enrollment_id
    WHERE M.type = 'Systolic BP'
      AND V.status = 'Completed'
      AND E.trial_id = 1
    GROUP BY E.patient_id
    HAVING AVG(M.value) < 130.0
) AS T1 ON P.patient_id = T1.patient_id;
```

GITHUB REPO: https://github.com/ohnonyx/ClinicalTrialAndResearch

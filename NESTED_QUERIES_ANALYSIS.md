# Nested Queries Analysis - Clinical Trial Research System

## Summary
This document outlines all locations in the codebase where nested queries (subqueries) are being used.

---

## 1. **Dashboard Route** (`Backend/Routes/dashboard.js`)
### Location: Core dashboard metrics endpoint

```javascript
router.get("/", async (req, res) => {
  const [rows] = await db.query(`
    SELECT 
      (SELECT COUNT(*) FROM Patients) AS total_patients,
      (SELECT COUNT(*) FROM Clinical_Trials) AS total_trials,
      (SELECT COUNT(*) FROM Visits) AS total_visits,
      (SELECT COUNT(*) FROM Visits WHERE status='Completed') AS completed_visits,
      (
        SELECT 
          ROUND(
            (SUM(CASE 
                   WHEN LOWER(o.outcome_value) IN ('responded','improved','positive','high response') 
                   THEN 1 ELSE 0 END) 
             / COUNT(*)) * 100, 
            2
          )
        FROM Trial_Outcomes o
      ) AS avg_response_rate
  `);
```

### Analysis:
- **Type**: Scalar subqueries (SELECT ... AS alias)
- **Count**: 5 subqueries in one statement
- **Subqueries Used**:
  1. `(SELECT COUNT(*) FROM Patients)` - Get total patients
  2. `(SELECT COUNT(*) FROM Clinical_Trials)` - Get total trials
  3. `(SELECT COUNT(*) FROM Visits)` - Get total visits
  4. `(SELECT COUNT(*) FROM Visits WHERE status='Completed')` - Get completed visits
  5. Complex subquery with CASE/SUM for average response rate

### Performance Concern: ⚠️ MODERATE
- These are scalar subqueries in SELECT clause, which can be inefficient
- Each subquery executes independently
- **Better approach**: Use JOINs or aggregation queries instead

### Recommended Refactor:
```javascript
// Instead of nested subqueries, use a single query with aggregations:
const [rows] = await db.query(`
  SELECT 
    (SELECT COUNT(*) FROM Patients) AS total_patients,
    (SELECT COUNT(*) FROM Clinical_Trials) AS total_trials,
    COUNT(DISTINCT v.visit_id) AS total_visits,
    SUM(CASE WHEN v.status='Completed' THEN 1 ELSE 0 END) AS completed_visits,
    ROUND(
      (SUM(CASE 
             WHEN LOWER(o.outcome_value) IN ('responded','improved','positive','high response') 
             THEN 1 ELSE 0 END) 
       / COUNT(DISTINCT o.outcome_id)) * 100, 
      2
    ) AS avg_response_rate
  FROM Visits v
  LEFT JOIN Trial_Outcomes o ON v.visit_id = o.visit_id
`);
```

---

## 2. **Patient History Route** (`Backend/Routes/patientHistory.js`)
### Location: Patient history retrieval endpoint

### Analysis:
- **Type**: Application-level nested queries (not database-level subqueries)
- **Structure**: Multiple sequential queries executed in a loop

### Pattern 1: Fetching enrollments for a patient
```javascript
const [enrollmentRows] = await db.query(`
  SELECT 
    e.enrollment_id,
    e.enrollment_date,
    e.status,
    t.trial_name
  FROM Patient_Enrollment e
  JOIN Clinical_Trials t ON e.trial_id = t.trial_id
  WHERE e.patient_id = ?;
`);

// Then loop through enrollments
for (const e of enrollmentRows) {
  // Query visits for each enrollment
  const [visitRows] = await db.query(`
    SELECT 
      v.visit_id,
      v.visit_number,
      v.actual_date,
      v.status
    FROM Visits v
    WHERE v.enrollment_id = ?;
  `, [e.enrollment_id]);

  // Then loop through visits
  for (const v of visitRows) {
    // Query measurements for each visit
    const [measurements] = await db.query(`
      SELECT measurement_id, type, value, unit
      FROM Measurements
      WHERE visit_id = ?;
    `);
    
    // Query medications for each visit
    const [medications] = await db.query(`
      SELECT 
        d.dispense_id,
        m.name,
        d.quantity_dispensed,
        d.dosage_instructions
      FROM Trial_Medication_Dispense d
      JOIN medication m ON d.medication_id = m.medication_id
      WHERE d.visit_id = ?;
    `);
    
    // Query outcomes for each visit
    const [outcomes] = await db.query(`
      SELECT outcome_id, outcome_type, outcome_value, notes
      FROM Trial_Outcomes
      WHERE visit_id = ?;
    `);
  }
}
```

### Performance Concern: 🔴 **CRITICAL - N+1 Query Problem**
- **Issue**: For each enrollment, queries are executed for visits
- **For each visit**, 3 more queries are executed (measurements, medications, outcomes)
- **Example**: 1 patient + 5 enrollments + 10 visits per enrollment = **51 total queries** instead of 1-2!

### Recommended Refactor:
Use a single query with JOINs or batch load all related data:

```javascript
// Single optimized query approach:
const [data] = await db.query(`
  SELECT 
    p.patient_id,
    p.first_name,
    p.last_name,
    p.gender,
    p.date_of_birth,
    c.email,
    c.phone_number,
    e.enrollment_id,
    e.enrollment_date,
    e.status,
    t.trial_id,
    t.trial_name,
    v.visit_id,
    v.visit_number,
    v.actual_date,
    v.status AS visit_status,
    m.measurement_id,
    m.type AS measurement_type,
    m.value,
    m.unit,
    d.dispense_id,
    med.name AS medication_name,
    d.quantity_dispensed,
    d.dosage_instructions,
    o.outcome_id,
    o.outcome_type,
    o.outcome_value,
    o.notes
  FROM Patients p
  LEFT JOIN Contact_Info c ON p.contact_id = c.contact_id
  LEFT JOIN Patient_Enrollment e ON p.patient_id = e.patient_id
  LEFT JOIN Clinical_Trials t ON e.trial_id = t.trial_id
  LEFT JOIN Visits v ON e.enrollment_id = v.enrollment_id
  LEFT JOIN Measurements m ON v.visit_id = m.visit_id
  LEFT JOIN Trial_Medication_Dispense d ON v.visit_id = d.visit_id
  LEFT JOIN medication med ON d.medication_id = med.medication_id
  LEFT JOIN Trial_Outcomes o ON v.visit_id = o.visit_id
  WHERE p.patient_id = ?
  ORDER BY e.enrollment_id, v.visit_id
`);

// Then group/organize the results in JavaScript
```

---

## 3. **Staff & Sites Route** (`Backend/Routes/staffandsites.js`)
### Analysis:
- ✅ **NO nested queries found**
- Uses proper JOINs and GROUP BY for aggregations
- **Example** (good pattern):
```javascript
SELECT 
  rs.site_id,
  rs.name,
  CONCAT(st.first_name, ' ', st.last_name) AS director_name,
  COUNT(DISTINCT pe.patient_id) AS total_patients
FROM research_sites AS rs
LEFT JOIN staff AS st ON rs.site_director_id = st.staff_id
LEFT JOIN patient_enrollment AS pe ON rs.site_id = pe.site_id
GROUP BY rs.site_id
```

---

## 4. **Visits Route** (`Backend/Routes/visits.js`)
### Analysis:
- ✅ **NO nested queries found**
- Uses proper JOIN pattern

---

## 5. **Other Routes** (trials.js, patients.js, measurements.js, etc.)
### Analysis:
- ✅ **NO nested queries found** in most routes
- Generally follow good SQL practices with JOINs

---

## Summary Table

| File | Type | Severity | Count | Notes |
|------|------|----------|-------|-------|
| dashboard.js | Scalar subqueries | ⚠️ MODERATE | 5 | Multiple COUNT subqueries in SELECT |
| patientHistory.js | N+1 Problem | 🔴 CRITICAL | 51+ queries | Loop-based sequential queries |
| staffandsites.js | None | ✅ GOOD | 0 | Uses JOINs properly |
| visits.js | None | ✅ GOOD | 0 | Uses JOINs properly |
| Other routes | None | ✅ GOOD | 0 | Generally follow best practices |

---

## Recommendations Priority

### 🔴 **HIGH PRIORITY** - Fix patientHistory.js
The N+1 query problem could cause:
- Database performance degradation with large datasets
- Increased server load
- Slow API responses
- **Action**: Refactor to single JOIN query + client-side grouping

### ⚠️ **MEDIUM PRIORITY** - Optimize dashboard.js
- Multiple scalar subqueries inefficient
- Could be combined into fewer queries
- **Action**: Consolidate subqueries using aggregation

### ✅ **MAINTAIN** - staffandsites.js, visits.js
- Already following best practices
- No changes needed

---

## Implementation Guide

### For patientHistory.js:
1. Replace loop-based queries with single JOIN query
2. Group results in JavaScript using reduce/map
3. Expected result: 51 queries → 1 query (98% reduction)

### For dashboard.js:
1. Move static COUNT subqueries to separate cached queries
2. Combine outcome analysis with visits table
3. Expected result: Could reduce from 5 subqueries to 2-3 main queries

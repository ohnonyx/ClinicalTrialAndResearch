import React, { useEffect, useState } from "react";

interface Patient {
  id?: number;
  name?: string;
  age?: number;
  email?: string;
  [key: string]: any; // fallback for any extra fields
}

const TestPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetch("http://localhost:3000/api/test")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }
        return res.json();
      })
      .then((data) => {
        setPatients(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Fetch error:", err);
        setError("Failed to load patient data");
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Patients (from MySQL)</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && (
        <ul>
          {patients.map((p, index) => (
            <li key={index}>
              {p.name
                ? `${p.name} (${p.age} years old)`
                : JSON.stringify(p)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TestPage;

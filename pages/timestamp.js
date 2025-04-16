// timestamp.js
import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useRouter } from "next/router";
import "../styles/timestamp.css";

export default function Timestamp() {
  const [timestamps, setTimestamps] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State untuk carian
  const [sortOrder, setSortOrder] = useState("desc"); // State untuk sorting order
  const router = useRouter();

  useEffect(() => {
    const fetchTimestamps = async () => {
      const q = query(collection(db, "timestamps"), orderBy("timestamp", sortOrder));
      const snapshot = await getDocs(q);
      setTimestamps(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchTimestamps();
  }, [sortOrder]); // Akan re-fetch data apabila sortOrder berubah

  // Fungsi untuk memproses carian tanpa mengubah data asal
  const filteredTimestamps = timestamps.filter(record => {
    return (
      record.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      new Date(record.timestamp?.seconds * 1000).toLocaleString().includes(searchTerm)
    );
  });

  return (
    <div className="timestamp-container">
      <h2 className="timestamp-title">Timestamp Records</h2>

      {/* --- Search Bar --- */}
      <input
        type="text"
        placeholder="Search by email or date..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />

      {/* --- Sort Order Dropdown --- */}
      <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="sort-dropdown">
        <option value="desc">Newest First</option>
        <option value="asc">Oldest First</option>
      </select>

      <table className="timestamp-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Email</th>
            <th>Timestamp</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredTimestamps.length > 0 ? (
            filteredTimestamps.map((record, index) => (
              <tr key={record.id}>
                <td>{index + 1}</td>
                <td>{record.email}</td>
                <td>{new Date(record.timestamp?.seconds * 1000).toLocaleString()}</td>
                <td>{record.action}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No records found.</td>
            </tr>
          )}
        </tbody>
      </table>

      <button className="back-btn" onClick={() => router.back()}>Back</button>
    </div>
  );
}

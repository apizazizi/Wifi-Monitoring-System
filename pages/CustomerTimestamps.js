import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useRouter } from "next/router";
import "../styles/CustomerTimestamps.css";

export default function CustomerTimestamps() {
  const [timestamps, setTimestamps] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [sortOrder, setSortOrder] = useState("desc"); // State untuk sorting order
  const router = useRouter();

  useEffect(() => {
    fetchCustomerTimestamps();
  }, [sortOrder]); // Fetch data setiap kali sortOrder berubah

  const fetchCustomerTimestamps = async () => {
    const customersSnapshot = await getDocs(collection(db, "customers"));
    const customersData = {};
    customersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      customersData[data.email] = data;
    });

    const q = query(collection(db, "customer_timestamps"), orderBy("timestamp", sortOrder));
    const snapshot = await getDocs(q);

    const records = snapshot.docs.map(doc => {
      const data = doc.data();
      const customerInfo = customersData[data.email] || {};

      let calculatedLogoutTimestamp = null;
      if (data.timestamp && customerInfo.rentalDays) {
        const loginDate = new Date(data.timestamp.seconds * 1000);
        calculatedLogoutTimestamp = new Date(loginDate);
        calculatedLogoutTimestamp.setDate(loginDate.getDate() + customerInfo.rentalDays);
      }

      return { 
        id: doc.id, 
        ...data,
        calculatedLogoutTimestamp,
        rentalDays: customerInfo.rentalDays || 0
      };
    });

    setTimestamps(records);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Not available";
    if (typeof timestamp === 'object' && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    }
    return timestamp.toLocaleString();
  };

  const filteredTimestamps = timestamps.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Fungsi untuk toggle sorting
  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "desc" ? "asc" : "desc"));
  };

  return (
    <div>
      <h2>Customer Timestamp Records</h2>
      
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search..."
        className="search-bar"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Sort Button */}
      <button className="sort-btn" onClick={toggleSortOrder}>
        Sort by Date ({sortOrder === "desc" ? "Newest First" : "Oldest First"})
      </button>

      <table border="1">
        <thead>
          <tr>
            <th>#</th>
            <th>Email</th>
            <th>Login Timestamp</th>
            <th>Logout Timestamp</th>
            <th>Rental Days</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredTimestamps.length > 0 ? (
            filteredTimestamps.map((record, index) => (
              <tr key={record.id}>
                <td>{index + 1}</td>
                <td>{record.email}</td>
                <td>{formatTimestamp(record.timestamp)}</td>
                <td>{record.calculatedLogoutTimestamp ? formatTimestamp(record.calculatedLogoutTimestamp) : "Not available"}</td>
                <td>{record.rentalDays}</td>
                <td>{record.action}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No records found.</td>
            </tr>
          )}
        </tbody>
      </table>
      <button onClick={() => router.back()}>Back</button>
    </div>
  );
}

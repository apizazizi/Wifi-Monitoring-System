import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from "firebase/firestore";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";
import "../styles/customer.css";

export default function Customer() {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [rentalDays, setRentalDays] = useState(""); // Tambah rentalDays
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCustomers = async () => {
      const snapshot = await getDocs(collection(db, "customers"));
      setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchCustomers();
  }, []);

  const generateExpiringLink = () => {
    const uniqueId = uuidv4();
    const expirationTime = Date.now() + 3600000; // 1 hour in milliseconds
    return `https://example.com/access/${uniqueId}?expires=${expirationTime}`;
  };

  const generatePassword = () => {
    return Math.random().toString(36).slice(-8); // Generate 8-character password
  };

  const sendWhatsAppMessage = (phoneNumber, email, password) => {
    const message = encodeURIComponent(`SELAMAT DATANG! Ini maklumat akses anda:\nEmail: ${email}\nPassword: ${password}\nSila login di sini: https://example.com/login`);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleAddCustomer = async () => {
    if (!name || !phone || !address || !email || !rentalDays) {
      alert("Sila isi semua maklumat termasuk Rental Days.");
      return;
    }
    
    const link = generateExpiringLink();
    const password = generatePassword();
    
    const docRef = await addDoc(collection(db, "customers"), { 
      name, 
      phone, 
      address, 
      email, 
      link, 
      password, 
      rentalDays: parseInt(rentalDays, 10) // Simpan rentalDays sebagai nombor
    });

    setCustomers([...customers, { id: docRef.id, name, phone, address, email, link, password, rentalDays }]);
    sendWhatsAppMessage(phone, email, password);
    
    setName("");
    setPhone("");
    setAddress("");
    setEmail("");
    setRentalDays(""); // Reset rentalDays selepas tambah pelanggan
  };

  const handleEditCustomer = async () => {
    if (!selectedCustomer) return;
    const docRef = doc(db, "customers", selectedCustomer.id);
    const link = generateExpiringLink();

    await updateDoc(docRef, { name, phone, address, email, link, rentalDays: parseInt(rentalDays, 10) });

    setCustomers(customers.map(c => (c.id === selectedCustomer.id ? { ...c, name, phone, address, email, link, rentalDays } : c)));
    setSelectedCustomer(null);
    setName("");
    setPhone("");
    setAddress("");
    setEmail("");
    setRentalDays("");
  };

  const handleDeleteCustomer = async (id) => {
    await deleteDoc(doc(db, "customers", id));
    setCustomers(customers.filter(c => c.id !== id));
  };

  return (
    <div className="customer-container">
      <h2 className="customer-title">Customer Management</h2>
      <div className="customer-form">
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="number" placeholder="Rental Days" value={rentalDays} onChange={(e) => setRentalDays(e.target.value)} required />
      </div>
      
      {selectedCustomer ? (
        <button className="customer-btn" onClick={handleEditCustomer}>Update Customer</button>
      ) : (
        <button className="customer-btn" onClick={handleAddCustomer}>Add Customer</button>
      )}
      
      <table className="customer-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone Number</th>
            <th>Address</th>
            <th>Email</th>
            <th>Rental Days</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.name}</td>
              <td>{customer.phone}</td>
              <td>{customer.address}</td>
              <td>{customer.email}</td>
              <td>{customer.rentalDays}</td>
              <td>
                <button className="edit-btn" onClick={() => { 
                  setSelectedCustomer(customer); 
                  setName(customer.name); 
                  setPhone(customer.phone); 
                  setAddress(customer.address); 
                  setEmail(customer.email); 
                  setRentalDays(customer.rentalDays);
                }}>Edit</button>
                <button className="delete-btn" onClick={() => handleDeleteCustomer(customer.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="customer-actions">
        <button className="customer-btn" onClick={() => router.back()}>Back</button>
        <button className="customer-btn" onClick={() => router.push("/CustomerTimestamps")}>Customer Timestamp</button>
      </div>
    </div>
  );
}

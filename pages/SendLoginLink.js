import { useState } from "react";
import { useRouter } from "next/router";
import { db } from "../firebaseConfig";
import { collection, getDocs, addDoc } from "firebase/firestore";

export default function SendLoginLink() {
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  // Cari customer berdasarkan email
  const searchCustomer = async () => {
    if (!searchEmail.trim()) {
      setMessage("Sila masukkan email customer");
      return;
    }

    try {
      const snapshot = await getDocs(collection(db, "customers"));
      const customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const customer = customers.find(c => c.email.toLowerCase() === searchEmail.toLowerCase());
      
      if (customer) {
        setSelectedCustomer(customer);
        setPhoneNumber(customer.phoneNumber || ""); // Jika ada nombor telefon dalam data customer
        setMessage(`Customer ditemui: ${customer.name}`);
      } else {
        setSelectedCustomer(null);
        setPhoneNumber("");
        setMessage("Customer tidak ditemui");
      }
    } catch (error) {
      console.error("Error searching customer:", error);
      setMessage("Ralat semasa mencari customer");
    }
  };

  // Buat token login untuk customer
  const generateLoginToken = async () => {
    if (!selectedCustomer) {
      setMessage("Sila cari customer terlebih dahulu");
      return;
    }

    if (!phoneNumber) {
      setMessage("Sila masukkan nombor telefon");
      return;
    }

    try {
      // Generate token (gunakan kaedah yang selamat dalam aplikasi produksi)
      const token = Math.random().toString(36).substring(2, 15) + 
                    Math.random().toString(36).substring(2, 15);
      
      // Simpan token dalam Firebase
      await addDoc(collection(db, "login_tokens"), {
        customerId: selectedCustomer.id,
        token: token,
        created: new Date().getTime(),
        expires: new Date().getTime() + (24 * 60 * 60 * 1000), // Tamat dalam 24 jam
        used: false
      });
      
      // Buat link login dengan token
      const loginUrl = `${window.location.origin}/CustomerLogin?token=${token}`;
      
      // Buat link WhatsApp
      sendWhatsAppLoginLink(phoneNumber, loginUrl, selectedCustomer.name);
      
      setMessage("Link login telah dihantar melalui WhatsApp!");
    } catch (error) {
      console.error("Error generating token:", error);
      setMessage("Ralat semasa membuat token login");
    }
  };

  // Fungsi untuk hantar link melalui WhatsApp
  const sendWhatsAppLoginLink = (phone, loginUrl, customerName) => {
    // Format nombor telefon (buang jika ada '+' atau space)
    const formattedPhone = phone.replace(/[\s+]/g, "");
    
    // Buat mesej WhatsApp
    const message = `Salam ${customerName}! Sila login ke akaun anda menggunakan link ini: ${loginUrl}`;
    
    // Buat link WhatsApp
    const whatsappLink = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    
    // Buka link dalam tetingkap baru
    window.open(whatsappLink, '_blank');
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h2>Hantar Link Login Untuk Customer</h2>
      
      {message && <p style={{ color: message.includes("Ralat") ? "red" : "green" }}>{message}</p>}
      
      <div style={{ marginBottom: "20px" }}>
        <h3>Cari Customer</h3>
        <div style={{ display: "flex", marginBottom: "10px" }}>
          <input 
            type="email" 
            placeholder="Email Customer" 
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            style={{ flex: 1, padding: "8px", marginRight: "10px" }}
          />
          <button 
            onClick={searchCustomer}
            style={{ padding: "8px 15px" }}
          >
            Cari
          </button>
        </div>
      </div>
      
      {selectedCustomer && (
        <div style={{ marginBottom: "20px", padding: "15px", border: "1px solid #ddd", borderRadius: "5px" }}>
          <h3>Maklumat Customer</h3>
          <p><strong>Nama:</strong> {selectedCustomer.name}</p>
          <p><strong>Email:</strong> {selectedCustomer.email}</p>
          <p><strong>Rental Days:</strong> {selectedCustomer.rentalDays || "Tidak ditetapkan"}</p>
          
          <h3>Hantar Link</h3>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Nombor Telefon (format: 60123456789)</label>
            <input 
              type="text" 
              placeholder="Nombor Telefon" 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          
          <button 
            onClick={generateLoginToken}
            style={{ padding: "10px 15px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Hantar Link WhatsApp
          </button>
        </div>
      )}
      
      <button 
        onClick={() => router.back()}
        style={{ padding: "8px 15px", marginTop: "20px" }}
      >
        Kembali
      </button>
    </div>
  );
}
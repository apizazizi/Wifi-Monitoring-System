import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import "../styles/CustomerDashboard.css";

export default function CustomerDashboard() {
  const [customer, setCustomer] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkSessionValidity = () => {
      const customerData = JSON.parse(sessionStorage.getItem("customer"));
      
      if (!customerData) {
        router.push("/CustomerLogin");
        return;
      }
      
      const loginTime = customerData.loginTime;
      const rentalDays = customerData.rentalDays || 1;
      const expiryTime = loginTime + rentalDays * 24 * 60 * 60 * 1000;
      const currentTime = new Date().getTime();
      
      if (currentTime >= expiryTime) {
        handleAutoLogout(customerData);
        return;
      }
      
      const timeRemaining = expiryTime - currentTime;
      const hoursRemaining = Math.floor(timeRemaining / (60 * 60 * 1000));
      const minutesRemaining = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
      
      setRemainingTime(`${hoursRemaining} jam, ${minutesRemaining} minit`);
      setCustomer(customerData);
    };
    
    checkSessionValidity();
    const interval = setInterval(checkSessionValidity, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAutoLogout = async (customerData) => {
    try {
      await addDoc(collection(db, "customer_timestamps"), {
        customer_id: customerData.id,
        email: customerData.email,
        timestamp: new Date(),
        action: "Auto Logout",
        rentalDays: customerData.rentalDays
      });
      sessionStorage.removeItem("customer");
      router.push({
        pathname: "/CustomerLogin",
        query: { message: "Your session has expired due to rental period completion." }
      });
    } catch (error) {
      console.error("Error during auto logout:", error);
    }
  };

  const handleQuit = async () => {
    try {
      await addDoc(collection(db, "customer_timestamps"), {
        customer_id: customer.id,
        email: customer.email,
        timestamp: new Date(),
        action: "Manual Logout"
      });
      sessionStorage.removeItem("customer");
      router.push("/CustomerLogin");
    } catch (error) {
      console.error("Error during manual logout:", error);
    }
  };

  return (
    <div className="dashboard-container">
      {customer ? (
        <>
          <h2 className="dashboard-title">Selamat Datang, {customer.name}!</h2>
          <h3 className="warning-text">JANGAN TUTUP PAGE INI SELAGI ANDA MENGGUNAKAN KHIDMAT KAMI!</h3>
          {remainingTime && <p className="time-remaining">Masa penggunaan yang tinggal: {remainingTime}</p>}
          <button className="quit-btn" onClick={handleQuit}>Quit</button>
        </>
      ) : (
        <p className="loading-text">Loading...</p>
      )}
    </div>
  );
}

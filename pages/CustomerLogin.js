import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { db } from "../firebaseConfig";
import { collection, getDocs, addDoc } from "firebase/firestore";
import "../styles/CustomerLogin.css";

export default function CustomerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (router.query.message) {
      setMessage(router.query.message);
    }
    if (router.query.token) {
      verifyLoginToken(router.query.token);
    }
  }, [router.query]);

  const verifyLoginToken = async (token) => {
    try {
      const loginTokensRef = collection(db, "login_tokens");
      const snapshot = await getDocs(loginTokensRef);
      const tokens = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const validToken = tokens.find(t => 
        t.token === token && 
        t.expires > new Date().getTime() &&
        !t.used
      );
      
      if (validToken) {
        const customerSnapshot = await getDocs(collection(db, "customers"));
        const customers = customerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const customer = customers.find(c => c.id === validToken.customerId);
        
        if (customer) {
          setEmail(customer.email);
          setMessage("Login token is valid. Please enter your password to continue.");
        } else {
          setMessage("Customer not found for this token.");
        }
      } else {
        setMessage("Invalid or expired login token.");
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      setMessage("Error verifying login token.");
    }
  };

  const handleLogin = async () => {
    const snapshot = await getDocs(collection(db, "customers"));
    const customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const customer = customers.find(c => c.email === email && c.password === password);

    if (customer) {
      const customerData = {
        ...customer,
        loginTime: new Date().getTime(),
        rentalDays: customer.rentalDays || 1
      };
      
      sessionStorage.setItem("customer", JSON.stringify(customerData));
      
      await addDoc(collection(db, "customer_timestamps"), {
        customer_id: customer.id,
        email: customer.email,
        timestamp: new Date(),
        action: "Login",
        rentalDays: customer.rentalDays || 1
      });
      
      router.push("/CustomerDashboard");
    } else {
      alert("Login failed! Invalid email or password.");
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Customer Login</h2>
      {message && <p className="login-message">{message}</p>}
      <input type="email" placeholder="Email" className="login-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" className="login-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button className="login-button" onClick={handleLogin}>Login</button>
    </div>
  );
}

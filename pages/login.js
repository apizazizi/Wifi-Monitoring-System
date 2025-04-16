import { useState } from "react";
import { auth, db } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/router";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import '../styles/login.css';


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Simpan Check-in
      await addDoc(collection(db, "timestamps"), {
        email: user.email,
        timestamp: serverTimestamp(),
        action: "Check-in"
      });
  
      // Redirect berdasarkan role
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().role === "admin") {
        router.push("/main");
      } else {
        router.push("/customer");
      }
  
    } catch (error) {
      alert("Login gagal: " + error.message);
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="Email" 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button type="submit">Login</button>
        </form>
        <button onClick={() => router.push("/register")} className="register-link">
          Register
        </button>
      </div>
    </div>
  );
  
}

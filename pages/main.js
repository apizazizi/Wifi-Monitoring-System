// pages/main.js
import { useRouter } from "next/router";
import { auth, db } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import "../styles/main.css";

export default function MainPage() {
  const router = useRouter();

  const handleLogout = async () => {
    if (auth.currentUser) {
      await addDoc(collection(db, "timestamps"), {
        email: auth.currentUser.email,
        timestamp: serverTimestamp(),
        action: "Check-out"
      });
      await signOut(auth);
    }
    router.push("/login");
  };

  return (
    <div className="main-container">
      <h2 className="main-title">Main Page</h2>
      <div className="button-group">
        <button className="main-btn" onClick={() => router.push("/customer")}>Add Customer</button>
        <button className="main-btn" onClick={() => router.push("/customer")}>View Customers</button>
        <button className="main-btn" onClick={() => router.push("/timestamp")}>View Staff Timestamp</button>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
        <button className="back-btn" onClick={() => router.back()}>Back</button>
      </div>
    </div>
  );
}

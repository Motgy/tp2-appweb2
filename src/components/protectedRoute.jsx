import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function ProtectedRoute({ children, requiredRole }) {
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            if (u) {
                setUser(u);
            
                const docSnap = await getDoc(doc(db, "users", u.uid));
                if (docSnap.exists()) {
                    setRole(docSnap.data().role);
                } else {
                    setRole("enseignant"); 
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsub();
    }, []);

    if (loading) return <div className="p-5"><progress className="progress is-small is-primary" max="100">Chargement...</progress></div>;

    if (!user) return <Navigate to="/" replace />;

    if (requiredRole && role !== requiredRole) {
        return role === "admin" ? <Navigate to="/admin" replace /> : <Navigate to="/home" replace />;
    }

    return children;
}
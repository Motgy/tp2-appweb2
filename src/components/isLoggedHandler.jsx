import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { saveUsertoFirestore } from "../components/authHandlers";

export default function useCheckAuth({ redirectIfNotLoggedIn = true } = {}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      setLoading(false);

      if (u) {
        await saveUsertoFirestore(u);
      } else if (redirectIfNotLoggedIn) {
        navigate("/");
      }
    });

    return () => unsub();
  }, [navigate, redirectIfNotLoggedIn]);

  return { user, loading };
}

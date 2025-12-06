import {
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";

import { doc, setDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

export async function saveUsertoFirestore(user) {
    try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            await setDoc(userRef, {
                uid: user.uid,
                displayName: user.displayName || "User",
                email: user.email || "",
                role: "enseignant",
                photoURL: user.photoURL || "",
                createdAt: new Date(),
            });
            console.log("User ajouté dans firestore");
        } else {
            console.log("User déjà dans firestore");
        }
    } catch (error) {
        console.log("Erreur: dans saveUsertoFirestore", error);
    }
}

export const handleGoogle = async (navigate, setLoading) => {
    setLoading(true);
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        await saveUsertoFirestore(result.user);
        navigate("/home");
    } catch (error) {
        alert("Erreur Google : " + error.message);
    }
    setLoading(false);
};
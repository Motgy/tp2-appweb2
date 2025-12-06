import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import { storage, db } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import {
    EmailAuthProvider,
    updatePassword,
    updateProfile,
    deleteUser,
    reauthenticateWithCredential,
    linkWithCredential,
} from "firebase/auth";
import useCheckAuth from "../components/isLoggedHandler";

export default function Profile() {
    const { user } = useCheckAuth({ redirectIfNotLoggedIn: true });
    const navigate = useNavigate();

    const [displayName, setDisplayName] = useState("");
    const [photoURL, setPhotoURL] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [emailToLink, setEmailToLink] = useState("");
    const [passwordToLink, setPasswordToLink] = useState("");
    const [loading, setLoading] = useState(false);

    const defaultAvatar = "https://www.pngfind.com/pngs/m/610-6104451_image-placeholder-png-user-profile-placeholder-image-png.png";

    useEffect(() => {
        if (!user) return;
        setDisplayName(user.displayName || "");
        setPhotoURL(user.photoURL || defaultAvatar);
    }, [user]);

    const handleFileChange = (e) => {
        if (e.target.files[0]) setImageFile(e.target.files[0]);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let photoURLUpload = photoURL;
            if (imageFile) {
                const imageRef = ref(storage, `profiles/${user.uid}`);
                await uploadBytes(imageRef, imageFile);
                photoURLUpload = await getDownloadURL(imageRef);
                setPhotoURL(photoURLUpload);
                setImageFile(null);
            }

            if (displayName || photoURLUpload) {
                await updateProfile(user, { displayName, photoURL: photoURLUpload });


                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    displayName: displayName || user.displayName || "",
                    photoURL: photoURLUpload || "",
                    email: user.email || "",
                    phoneNumber: user.phoneNumber || "",
                    updatedAt: new Date()
                }, { merge: true });
            }

            if (newPassword) {
                if (newPassword !== confirmNewPassword) {
                    alert("Les nouveaux mots de passe ne correspondent pas");
                    setLoading(false);
                    return;
                }

                const currentPassword = prompt("Entrez votre mot de passe actuel pour modifier le mot de passe :");
                if (!currentPassword) {
                    alert("Modification annulée");
                    setLoading(false);
                    return;
                }

                const credential = EmailAuthProvider.credential(user.email, currentPassword);
                await reauthenticateWithCredential(user, credential);
                await updatePassword(user, newPassword);
                setNewPassword("");
                setConfirmNewPassword("");
                alert("Mot de passe mis à jour !");
            }

        } catch (error) {
            console.error(error);
            alert("Erreur lors de la sauvegarde : " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Voulez-vous vraiment supprimer votre compte ?")) return;
        setLoading(true);
        try {
            await deleteDoc(doc(db, "users", user.uid));
            await deleteUser(user);
            alert("Compte supprimé !");
            navigate("/");
        } catch (error) {
            console.error(error);
            alert("Impossible de supprimer le compte : " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLinkAccount = async (e) => {
        e.preventDefault();
        if (!emailToLink || !passwordToLink) {
            alert("Veuillez entrer un e-mail et un mot de passe");
            return;
        }

        try {
            const credential = EmailAuthProvider.credential(emailToLink, passwordToLink);
            await linkWithCredential(user, credential);
            await setDoc(doc(db, "users", user.uid), {
                email: emailToLink,
                displayName: user.displayName || "",
                createdAt: new Date()
            });
            alert("Compte lié avec succès !");
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert("Erreur lors du lien du compte : " + error.message);
        }
    };

    if (!user) return <p>Chargement...</p>;

    const providerId = user.providerData[0]?.providerId;
    let accountType = "E-mail";
    if (user.isAnonymous) accountType = "Anonyme";
    else if (providerId === "google.com") accountType = "Google";
    else if (providerId === "twitter.com") accountType = "Twitter";
    else if (providerId === "github.com") accountType = "Github";
    else if (providerId === "phone") accountType = "Phone";

    const canModifyName = providerId === "google.com" || providerId === "twitter.com" || providerId === "password";
    const canModifyPhoto = true;
    const canModifyPassword = providerId === "password";

    return (
        <div className="container mt-6">
            <div className="card" style={{ maxWidth: "500px", margin: "auto", padding: "20px" }}>
                <div className="has-text-centered">
                    <figure className="image is-128x128 is-inline-block" style={{ borderRadius: "50%", overflow: "hidden" }}>
                        <img
                            src={photoURL || defaultAvatar}
                            alt="Profil"
                            style={{ objectFit: "cover", width: "128px", height: "128px", borderRadius: "50%" }}
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = defaultAvatar; }}
                        />
                    </figure>

                    <h1 className="title mt-3">{providerId === "phone" ? user.phoneNumber : displayName || "Anonymous"}</h1>

                    {(providerId !== "twitter.com" && providerId !== "phone" && providerId !== "github.com") &&
                        <p><strong>E-mail :</strong> {user.email}</p>
                    }

                    <p><strong>Type de compte :</strong> {accountType}</p>

                    {(providerId === "password" || providerId === "google.com") &&
                        <p><strong>Vérifié :</strong> {user.emailVerified ? "Oui" : "Non"}</p>
                    }

                    {(providerId === "password" && !user.emailVerified) &&
                        <div className="mt-2 has-text-centered">
                            <button
                                className="button is-small is-warning mt-2"
                                onClick={() => { import("firebase/auth").then(({ sendEmailVerification }) => { sendEmailVerification(user); alert("E-mail de vérification renvoyé !"); }); }}
                            >
                                Renvoyer l’e-mail de vérification
                            </button>
                        </div>
                    }
                </div>

                <div className="mt-5">
                    {(canModifyName || canModifyPhoto || canModifyPassword) &&
                        <>
                            <h2 className="title is-5">Modifier le profil</h2>
                            <form onSubmit={handleSave}>
                                {canModifyPhoto &&
                                    <div className="field">
                                        <label className="label">Photo de profil</label>
                                        <div className="control">
                                            <input className="input" type="file" accept="image/*" onChange={handleFileChange} />
                                        </div>
                                    </div>
                                }

                                {canModifyName &&
                                    <div className="field">
                                        <label className="label">Nom d'utilisateur</label>
                                        <div className="control">
                                            <input className="input" type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} />
                                        </div>
                                    </div>
                                }

                                {canModifyPassword &&
                                    <>
                                        <div className="field">
                                            <label className="label">Nouveau mot de passe</label>
                                            <div className="control">
                                                <input className="input" type="password" placeholder="Entrez le nouveau mot de passe" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                                            </div>
                                        </div>

                                        <div className="field">
                                            <label className="label">Confirmer le nouveau mot de passe</label>
                                            <div className="control">
                                                <input className="input" type="password" placeholder="Confirmez le nouveau mot de passe" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} />
                                            </div>
                                        </div>
                                    </>
                                }

                                <div className="columns mt-4">
                                    <div className="column">
                                        {(canModifyPhoto || canModifyName || canModifyPassword) &&
                                            <button className={`button is-link is-fullwidth ${loading ? "is-loading" : ""}`} type="submit">Sauvegarder</button>
                                        }
                                    </div>
                                    <div className="column">
                                        <button className="button is-danger is-fullwidth" type="button" onClick={handleDeleteAccount}>Supprimer votre compte</button>
                                    </div>
                                </div>
                            </form>
                        </>
                    }
                </div>

                {user.isAnonymous &&
                    <div className="mt-5">
                        <h2 className="title is-5">Passer à un compte email/mot de passe</h2>
                        <form onSubmit={handleLinkAccount}>
                            <div className="field">
                                <label className="label">Adresse e-mail</label>
                                <div className="control">
                                    <input className="input" type="email" placeholder="Entrez votre e-mail" value={emailToLink} onChange={e => setEmailToLink(e.target.value)} />
                                </div>
                            </div>
                            <div className="field">
                                <label className="label">Mot de passe</label>
                                <div className="control">
                                    <input className="input" type="password" placeholder="Choisissez un mot de passe" value={passwordToLink} onChange={e => setPasswordToLink(e.target.value)} />
                                </div>
                            </div>
                            <button className="button is-primary is-fullwidth" type="submit">Convertir le compte</button>
                        </form>
                    </div>
                }
            </div>
        </div>
    );
}

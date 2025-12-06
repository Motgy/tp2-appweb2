import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    updateProfile,
} from "firebase/auth";
import { handleGoogle } from "../components/authHandlers";

export default function SignUp() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [pwd, setPwd] = useState("");
    const [pwd2, setPwd2] = useState("");
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => setUser(u));
        return () => unsub();
    }, []);

    const handleSignup = async (e) => {
        e.preventDefault();
        if (pwd !== pwd2) return alert("Les mots de passe ne correspondent pas.");
        
        setLoading(true);
        try {
            const userCred = await createUserWithEmailAndPassword(auth, email, pwd);
            await updateProfile(userCred.user, { displayName: name.trim() });
            await sendEmailVerification(userCred.user);
            alert("Compte créé ! Vérifiez vos emails.");
            navigate("/home");
        } catch (err) {
            console.error(err);
            alert("Erreur : " + err.message);
        }
        setLoading(false);
    };

    if (user) return <Navigate to="/home" replace />;

    return (
        <div className="auth-page-bg">
            <div className="container" style={{maxWidth: '500px', marginTop:"15px"}}>
                <div className="auth-card p-6">
                    <div className="has-text-centered mb-6">
                        <div className="is-inline-block has-background-primary-light p-3 rounded-full mb-3">
                            <i className="fas fa-user-plus fa-2x has-text-primary"></i>
                        </div>
                        <h1 className="title is-4">Créer un compte</h1>
                        <p className="subtitle is-6">Rejoignez la plateforme</p>
                    </div>

                    <form onSubmit={handleSignup}>
                        <div className="field">
                            <label className="label is-small">Nom complet</label>
                            <div className="control has-icons-left">
                                <input className="input" type="text" placeholder="Jordan Carter" value={name} onChange={(e) => setName(e.target.value)} required />
                                <span className="icon is-small is-left"><i className="fas fa-user"></i></span>
                            </div>
                        </div>

                        <div className="field">
                            <label className="label is-small">Email professionnel</label>
                            <div className="control has-icons-left">
                                <input className="input" type="email" placeholder="nom@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                <span className="icon is-small is-left"><i className="fas fa-envelope"></i></span>
                            </div>
                        </div>

                        <div className="field">
                            <label className="label is-small">Mot de passe</label>
                            <div className="control has-icons-left">
                                <input className="input" type="password" placeholder="Min. 6 caractères" value={pwd} onChange={(e) => setPwd(e.target.value)} required />
                                <span className="icon is-small is-left"><i className="fas fa-lock"></i></span>
                            </div>
                        </div>

                        <div className="field">
                            <label className="label is-small">Confirmer mot de passe</label>
                            <div className="control has-icons-left">
                                <input className="input" type="password" placeholder="Répétez le mot de passe" value={pwd2} onChange={(e) => setPwd2(e.target.value)} required />
                                <span className="icon is-small is-left"><i className="fas fa-lock"></i></span>
                            </div>
                        </div>

                        <button className={`button is-primary is-fullwidth mt-5 ${loading ? 'is-loading' : ''}`}>
                            S'inscrire
                        </button>
                    </form>

                    <div className="is-flex is-align-items-center my-5">
                        <hr className="flex-grow-1 m-0" style={{backgroundColor: '#e5e7eb', height: '1px'}}/>
                        <span className="mx-3 has-text-grey-light is-size-7">OU</span>
                        <hr className="flex-grow-1 m-0" style={{backgroundColor: '#e5e7eb', height: '1px'}}/>
                    </div>

                    <button onClick={() => handleGoogle(navigate, setLoading)} className="button is-white is-fullwidth">
                        <span className="icon mr-2"><img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" style={{width: 18}}/></span>
                        <span>S'inscrire avec Google</span>
                    </button>

                    <div className="has-text-centered mt-5">
                        <p className="is-size-7">
                            Déjà un compte ? <a onClick={() => navigate("/")} className="has-text-primary has-text-weight-bold" style={{cursor:'pointer'}}>Connexion</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
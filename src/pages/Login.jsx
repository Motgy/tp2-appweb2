import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { handleGoogle } from "../components/authHandlers";
import BubbleBackground from "../components/BubbleBackground";

export default function Login() {
    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => { if (u) navigate("/home"); });
        return () => unsub();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try { await signInWithEmailAndPassword(auth, email, pwd); } catch (err) { alert("Erreur de connexion"); }
        setLoading(false);
    };

    return (
        <div className="auth-page-bg" style={{ position: 'relative', overflow: 'hidden' }}>

            <BubbleBackground />
            <div className="container" style={{ maxWidth: '450px', position: 'relative', zIndex: 1 }}>
                <div className="auth-card p-6">
                    <div className="has-text-centered mb-6">
                        <div className="is-inline-block has-background-primary-light p-3 mb-3" style={{ borderRadius: '50%' }}>
                            <i className="fas fa-graduation-cap fa-2x has-text-primary"></i>
                        </div>
                        <h1 className="title is-4">Bienvenue</h1>
                        <p className="subtitle is-6">Connectez-vous pour continuer</p>
                    </div>

                    <form onSubmit={handleLogin}>
                        <div className="field">
                            <label className="label is-small">Email</label>
                            <div className="control has-icons-left">
                                <input className="input" type="email" placeholder="nom@exemple.com" value={email} onChange={e => setEmail(e.target.value)} required />
                                <span className="icon is-small is-left"><i className="fas fa-envelope"></i></span>
                            </div>
                        </div>

                        <div className="field">
                            <label className="label is-small">Mot de passe</label>
                            <div className="control has-icons-left">
                                <input className="input" type="password" placeholder="••••••••" value={pwd} onChange={e => setPwd(e.target.value)} required />
                                <span className="icon is-small is-left"><i className="fas fa-lock"></i></span>
                            </div>
                        </div>

                        <button className={`button is-primary is-fullwidth mt-5 ${loading ? 'is-loading' : ''}`}>
                            Se connecter
                        </button>
                    </form>

                    <div className="is-flex is-align-items-center my-5">
                        <hr className="flex-grow-1 m-0" style={{ backgroundColor: '#e5e7eb', height: '1px' }} />
                        <span className="mx-3 has-text-grey-light is-size-7">OU</span>
                        <hr className="flex-grow-1 m-0" style={{ backgroundColor: '#e5e7eb', height: '1px' }} />
                    </div>

                    <button onClick={() => handleGoogle(navigate, setLoading)} className="button is-white is-fullwidth">
                        <span className="icon mr-2"><img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" style={{ width: 18 }} /></span>
                        <span>Continuer avec Google</span>
                    </button>

                    <div className="has-text-centered mt-5">
                        <p className="is-size-7">
                            Pas encore de compte ? <a onClick={() => navigate("/signup")} className="has-text-primary has-text-weight-bold" style={{ cursor: 'pointer' }}>Créer un compte</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
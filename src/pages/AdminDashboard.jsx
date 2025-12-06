import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, orderBy, query, updateDoc, doc, where } from "firebase/firestore";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const q = query(collection(db, "forms"), orderBy("createdAt", "desc"));
                const snap = await getDocs(q);
                setForms(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => a.isActive ? -1 : 1));
            } catch (e) { 
                console.error(e); 
            } finally { 
                setLoading(false); 
            }
        };
        fetch();
    }, []);

    const toggleActive = async (id) => {
        if (!confirm("Activer ce formulaire désactivera tous les autres. Continuer ?")) return;
        
        try {
            const q = query(collection(db, "forms"), where("isActive", "==", true));
            const snap = await getDocs(q);
            await Promise.all(snap.docs.map(d => updateDoc(d.ref, { isActive: false })));
            
            await updateDoc(doc(db, "forms", id), { isActive: true });
            
            window.location.reload();
        } catch (error) {
            alert("Erreur : " + error.message);
        }
    };

    const deactivate = async (id) => {
        if (confirm("Désactiver ce formulaire ? Les enseignants ne pourront plus soumettre.")) {
            await updateDoc(doc(db, "forms", id), { isActive: false });
            window.location.reload();
        }
    };

    return (
        <div className="container is-max-widescreen p-5">
            <div className="columns is-vcentered mb-6">
                <div className="column">
                    <h1 className="title is-3 mb-2">Dashboard Coordinateur</h1>
                    <p className="subtitle is-6">Gestion des modèles de plans et suivi des validations</p>
                </div>
                <div className="column is-narrow">
                    <div className="buttons">
                        <button className="button is-white shadow-sm" onClick={() => navigate("/admin/plans")}>
                            <span className="icon has-text-info"><i className="fas fa-clipboard-list"></i></span>
                            <span>Suivre les soumissions</span>
                        </button>
                        <button className="button is-primary is-rounded shadow-lg" onClick={() => navigate("/admin/create-form")}>
                            <span className="icon"><i className="fas fa-plus"></i></span>
                            <span>Nouveau Modèle</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="is-flex is-align-items-center mb-5 pb-2" style={{borderBottom: '1px solid #e5e7eb'}}>
                <span className="icon-box has-background-primary-light has-text-primary rounded p-2 mr-3">
                    <i className="fas fa-layer-group"></i>
                </span>
                <h3 className="title is-5 m-0">Modèles de Session</h3>
            </div>

            {loading ? (
                <div className="has-text-centered py-6">
                    <div className="loader is-size-3 inline-block"></div>
                </div>
            ) : (
                <div className="columns is-multiline">
                    {forms.length === 0 ? (
                        <div className="column is-full">
                            <div className="box has-text-centered py-6 has-background-white-ter dashed-border">
                                <p className="has-text-grey">Aucun modèle de formulaire créé.</p>
                            </div>
                        </div>
                    ) : (
                        forms.map(form => (
                            <div key={form.id} className="column is-4-desktop is-6-tablet">
                                <div className={`modern-card h-full is-flex is-flex-direction-column ${form.isActive ? 'is-active-border' : ''}`} 
                                     style={form.isActive ? {border: '2px solid #4f46e5'} : {opacity: 0.9}}>
                                    
                                    <div className="card-content flex-grow-1">
                                        <div className="is-flex is-justify-content-space-between mb-4">
                                            <div className={`p-2 rounded is-flex-centered ${form.isActive ? 'has-background-primary has-text-white' : 'has-background-grey-lighter has-text-grey'}`} style={{width: 40, height: 40}}>
                                                <i className={`fas ${form.isActive ? 'fa-bolt' : 'fa-archive'}`}></i>
                                            </div>
                                            {form.isActive ? 
                                                <span className="tag is-primary is-light is-rounded has-text-weight-bold">ACTIF</span> : 
                                                <span className="tag is-light is-rounded">ARCHIVÉ</span>
                                            }
                                        </div>

                                        <h3 className="title is-5 mb-2" style={{lineHeight: 1.3}}>{form.title}</h3>
                                        <p className="subtitle is-7 mb-4">
                                            <i className="fas fa-list-ol mr-1"></i> {form.questions?.length || 0} questions
                                        </p>
                                        
                                        {form.createdAt && (
                                            <p className="is-size-7 has-text-grey-light">
                                                Créé le {new Date(form.createdAt.seconds * 1000).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>

                                    <div className="card-footer p-3 has-background-white-bis" style={{borderTop: '1px solid #f3f4f6'}}>
                                        <div className="buttons is-flex is-justify-content-space-between w-full m-0">
                                            <button onClick={() => navigate(`/admin/edit-form/${form.id}`)} className="button is-small is-white">
                                                <span className="icon is-small"><i className="fas fa-edit"></i></span>
                                                <span>Modifier</span>
                                            </button>
                                            
                                            {form.isActive ? 
                                                <button onClick={() => deactivate(form.id)} className="button is-small is-danger is-light">
                                                    <span>Désactiver</span>
                                                </button> :
                                                <button onClick={() => toggleActive(form.id)} className="button is-small is-success is-light">
                                                    <span className="icon is-small"><i className="fas fa-check"></i></span>
                                                    <span>Activer</span>
                                                </button>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
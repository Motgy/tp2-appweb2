import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function TeacherDashboard() {
    const [plans, setPlans] = useState([]);
    const [activeForm, setActiveForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetch = async () => {
            if (!auth.currentUser) return;
            const q = query(collection(db, "plans"), where("teacherId", "==", auth.currentUser.uid), orderBy("updatedAt", "desc"));
            const snap = await getDocs(q);
            setPlans(snap.docs.map(d => ({ id: d.id, ...d.data() })));

            const fq = query(collection(db, "forms"), where("isActive", "==", true));
            const fsnap = await getDocs(fq);
            if (!fsnap.empty) setActiveForm(fsnap.docs[0].data());
            setLoading(false);
        };
        fetch();
    }, []);

    const getStatusColor = (status) => {
        switch(status) {
            case "Validé": return "is-success";
            case "À corriger": return "is-danger";
            case "Soumis": return "is-info";
            default: return "is-warning";
        }
    };

    return (
        <div className="container is-max-widescreen p-5">
            <div className="columns is-vcentered mb-6">
                <div className="column">
                    <h1 className="title is-4">Bonjour, {auth.currentUser?.displayName || 'Enseignant'} 👋</h1>
                    <p className="subtitle is-6">Gérez vos plans de cours</p>
                </div>
                <div className="column is-narrow">
                    <button onClick={() => navigate("/create-plan")} disabled={!activeForm} className="button is-primary is-rounded shadow-md">
                        <span className="icon"><i className="fas fa-plus"></i></span> 
                        <span>Nouveau Plan</span>
                    </button>
                </div>
            </div>

            {activeForm && (
                <div className="notification is-white shadow-sm mb-6" style={{borderLeft: '4px solid #4f46e5'}}>
                    <div className="is-flex is-align-items-center">
                        <span className="icon has-text-success mr-3"><i className="fas fa-check-circle"></i></span>
                        <span><strong>Session active :</strong> {activeForm.title}</span>
                    </div>
                </div>
            )}

            <div className="columns is-multiline">
                {plans.length === 0 && !loading && (
                     <div className="column is-full">
                        <div className="box has-text-centered py-6 has-background-white-ter" style={{border: '2px dashed #dbdbdb'}}>
                            <p className="has-text-grey">Aucun plan pour le moment.</p>
                        </div>
                     </div>
                )}

                {plans.map(plan => (
                    <div key={plan.id} className="column is-4-desktop is-6-tablet">
                        <div className="modern-card h-full is-flex is-flex-direction-column">
                            <div className="p-5 flex-grow-1"> 
                                <div className="is-flex is-align-items-start mb-4">
                                    <div className="has-background-primary-light has-text-primary rounded p-3 mr-4">
                                        <i className="fas fa-book fa-lg"></i>
                                    </div>
                                    <div style={{width: '100%'}}>
                                        <div className="is-flex is-justify-content-space-between is-align-items-start mb-1">
                                            <span className="has-text-weight-bold is-size-5" style={{wordBreak: 'break-word', marginRight: '10px'}}>
                                                {plan.courseCode || "Sans titre"}
                                            </span>
                                
                                            <span className={`tag is-rounded is-light ${getStatusColor(plan.status)}`} style={{flexShrink: 0}}>
                                                {plan.status}
                                            </span>
                                        </div>
                                        <p className="is-size-7 has-text-grey">
                                            Modifié le {new Date(plan.updatedAt?.seconds * 1000).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-3 has-background-white-bis" style={{borderTop:'1px solid #f3f4f6'}}>
                                <button onClick={() => navigate(`/plan/edit/${plan.id}`)} className="button is-white is-small is-fullwidth has-text-weight-bold">
                                    {plan.status === "Validé" ? <><i className="fas fa-eye mr-2"></i> Consulter</> : <><i className="fas fa-edit mr-2"></i> Modifier</>}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
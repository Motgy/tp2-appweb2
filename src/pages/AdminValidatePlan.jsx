import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function AdminValidatePlan() {
    const { planId } = useParams();
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [form, setForm] = useState(null);
    const [comment, setComment] = useState("");

    useEffect(() => {
        const fetch = async () => {
            const pSnap = await getDoc(doc(db, "plans", planId));
            if (!pSnap.exists()) return navigate("/admin/plans");
            setPlan(pSnap.data());
            setComment(pSnap.data().adminComment || "");

            const fSnap = await getDoc(doc(db, "forms", pSnap.data().formId));
            if (fSnap.exists()) setForm(fSnap.data());
        };
        fetch();
    }, [planId]);

    const handleDecision = async (status) => {
        if (status === "À corriger" && !comment.trim()) return alert("Ajoutez un commentaire pour le prof.");
        if (!window.confirm(`Marquer comme ${status} ?`)) return;

        await updateDoc(doc(db, "plans", planId), {
            status,
            adminComment: comment,
            validatedAt: serverTimestamp()
        });
        navigate("/admin/plans");
    };

    if (!plan || !form) return <div className="p-5">Chargement...</div>;

    return (
        <div className="container mt-5 mb-6">
            <h1 className="title">Validation : {plan.courseCode}</h1>
            
            <div className="notification is-light">
                <p><strong>Enseignant :</strong> {plan.teacherName}</p>
                <p><strong>Cours :</strong> {plan.courseCode}</p>
                <p><strong>Statut actuel :</strong> {plan.status}</p>

                {plan.pdfUrl && (
                    <a 
                        href={plan.pdfUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="button is-small is-danger is-outlined mt-2"
                    >
                        <span className="icon"><i className="fas fa-file-pdf"></i></span>
                        <span>Télécharger le PDF officiel</span>
                    </a>
                )}
            </div>

            <div className="columns">
                <div className="column is-two-thirds">
                    {form.questions.map((q, i) => (
                        <div key={q.id} className="box">
                            <strong>Q{i + 1}: {q.text}</strong>
                            
                            <div className="notification is-white mt-2 p-3" style={{borderLeft: "4px solid #3298dc"}}>
                                {plan.answers?.[q.id] || "Aucune réponse fournie."}
                            </div>
                            
                            {plan.validations?.[q.id] && (
                                <p className="is-size-7 has-text-grey mt-1">
                                    <strong>Analyse IA : </strong> 
                                    <span className={plan.validations[q.id].status === "Conforme" ? "has-text-success" : "has-text-warning"}>
                                        {plan.validations[q.id].status}
                                    </span>
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                <div className="column">
                    <div className="box has-background-warning-light" style={{ position: "sticky", top: "20px" }}>
                        <h3 className="title is-5">Décision</h3>
                        <div className="field">
                            <label className="label">Commentaire / Corrections</label>
                            <textarea className="textarea" rows="4"
                                value={comment} onChange={(e) => setComment(e.target.value)}
                                placeholder="Message pour l'enseignant..."
                            ></textarea>
                        </div>
                        <div className="buttons is-centered">
                            <button className="button is-danger" onClick={() => handleDecision("À corriger")}>Demander Correction</button>
                            <button className="button is-success" onClick={() => handleDecision("Validé")}>Valider le Plan</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
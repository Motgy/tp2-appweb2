import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { validateAnswerWithAI } from "../components/openai";
import { generateAndUploadPDF } from "../components/pdfGenerator";

export default function EditPlan() {
    const { planId } = useParams();
    const navigate = useNavigate();
    
    const [plan, setPlan] = useState(null);
    const [form, setForm] = useState(null);
    const [answers, setAnswers] = useState({});
    const [validations, setValidations] = useState({});
    const [validating, setValidating] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const planRef = doc(db, "plans", planId);
                const planSnap = await getDoc(planRef);
                
                if (!planSnap.exists()) return navigate("/home");

                const planData = planSnap.data();
                setPlan(planData);
                setAnswers(planData.answers || {});
                setValidations(planData.validations || {});

                const formRef = doc(db, "forms", planData.formId);
                const formSnap = await getDoc(formRef);
                if (formSnap.exists()) setForm(formSnap.data());

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [planId, navigate]);

    const handleValidate = async (qid, qtext, rule) => {
        setValidating({ ...validating, [qid]: true });
        const res = await validateAnswerWithAI(qtext, answers[qid], rule);
        setValidations({ ...validations, [qid]: res });
        setValidating({ ...validating, [qid]: false });
    };

const updateData = async (status) => {
        if (status === "Soumis" && !window.confirm("Soumettre définitivement ?")) return;
        
        setLoading(true);

        try {
            let pdfUrl = plan.pdfUrl || ""; 

            if (status === "Soumis") {
                const planTemp = { courseCode: plan.courseCode, answers };
                const teacherName = auth.currentUser.displayName || "Enseignant";
                pdfUrl = await generateAndUploadPDF(planTemp, form, teacherName);
            }

            await updateDoc(doc(db, "plans", planId), {
                answers, 
                validations, 
                status, 
                pdfUrl, 
                updatedAt: serverTimestamp()
            });
            
            navigate("/home");
        } catch (e) { 
            console.error(e);
            alert("Erreur sauvegarde : " + e.message); 
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-5">Chargement...</div>;
    if (!form) return <div className="p-5">Formulaire introuvable.</div>;

    const readOnly = plan.status === "Soumis" || plan.status === "Validé";

    return (
        <div className="container mt-5 mb-6">
            <div className="is-flex is-justify-content-space-between mb-4">
                <h1 className="title">{readOnly ? "Consultation" : "Modification"} : {plan.courseCode}</h1>
                <span className="tag is-info is-large">{plan.status}</span>
            </div>

            {plan.adminComment && (
                <div className="notification is-danger is-light">
                    <strong>Message du coordonnateur :</strong> {plan.adminComment}
                </div>
            )}

            {form.questions.map((q, index) => (
                <div key={q.id} className="box">
                    <h4 className="title is-6">Q{index+1}: {q.text}</h4>
                    <textarea 
                        className="textarea mb-2" rows="3" disabled={readOnly}
                        value={answers[q.id] || ""}
                        onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    ></textarea>
                    
                    {!readOnly && (
                        <button className={`button is-small is-info ${validating[q.id]?"is-loading":""}`} 
                            onClick={() => handleValidate(q.id, q.text, q.aiRule)}>
                            Vérifier IA
                        </button>
                    )}
                    
                    {validations[q.id] && (
                        <div className="message is-small mt-2">
                            <div className="message-body">
                                <strong>IA: {validations[q.id].status}</strong> - {validations[q.id].suggestion}
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {!readOnly && (
                <div className="buttons is-right">
                    <button className="button" onClick={() => updateData("Brouillon")}>Sauvegarder</button>
                    <button className="button is-primary" onClick={() => updateData("Soumis")}>Soumettre</button>
                </div>
            )}
            <button className="button is-fullwidth mt-2" onClick={() => navigate("/home")}>Retour</button>
        </div>
    );
}
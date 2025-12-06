import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { validateAnswerWithAI } from "../components/openai";
import { generateAndUploadPDF } from "../components/pdfGenerator";

export default function FillPlan() {
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({});
    const [validations, setValidations] = useState({});
    const [validating, setValidating] = useState({});
    const [courseCode, setCourseCode] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchActiveForm = async () => {
            try {
                const q = query(collection(db, "forms"), where("isActive", "==", true));
                const snapshot = await getDocs(q);
                
                if (!snapshot.empty) {
                    setForm({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
                } else {
                    setForm(null);
                }
            } catch (error) {
                console.error("Erreur:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchActiveForm();
    }, []);

    const handleValidate = async (questionId, questionText, rule) => {
        const answer = answers[questionId];
        if (!answer?.trim()) return alert("Veuillez écrire une réponse.");

        setValidating({ ...validating, [questionId]: true });
        const result = await validateAnswerWithAI(questionText, answer, rule);
        setValidations({ ...validations, [questionId]: result });
        setValidating({ ...validating, [questionId]: false });
    };

 const saveData = async (status) => {
        if (!courseCode) return alert("Code du cours obligatoire.");
        if (!form) return;
        
        if (status === "Soumis" && !window.confirm("Confirmer la soumission finale ? Un PDF sera généré.")) return;

        setLoading(true); 

        try {
            let pdfUrl = "";

            if (status === "Soumis") {
                const planTemp = { courseCode, answers };
                const teacherName = auth.currentUser.displayName || "Enseignant";
                pdfUrl = await generateAndUploadPDF(planTemp, form, teacherName);
            }

            await addDoc(collection(db, "plans"), {
                teacherId: auth.currentUser.uid,
                teacherName: auth.currentUser.displayName || auth.currentUser.email,
                formId: form.id,
                courseCode,
                answers,
                validations,
                status: status,
                pdfUrl: pdfUrl,
                updatedAt: serverTimestamp()
            });

            alert(status === "Soumis" ? "Plan soumis et PDF généré !" : "Brouillon sauvegardé.");
            navigate("/home");
        } catch (e) {
            console.error(e);
            alert("Erreur lors de la sauvegarde : " + e.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-5 has-text-centered">Chargement...</div>;
    if (!form) return (
        <div className="notification is-warning m-5">
            Aucun formulaire actif. Contactez l'administrateur.
            <br/><button className="button is-small mt-2" onClick={() => navigate("/home")}>Retour</button>
        </div>
    );

    return (
        <div className="container mt-5 mb-6">
            <h1 className="title">Nouveau Plan de Cours</h1>
            <h2 className="subtitle">Modèle : {form.title}</h2>

            <div className="field mb-5">
                <label className="label">Code du cours</label>
                <input className="input" type="text" placeholder="Ex: 420-101-TQ" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} />
            </div>

            <hr />

            {form.questions.map((q, index) => (
                <div key={q.id} className="box">
                    <h3 className="title is-5">Q{index + 1}: {q.text}</h3>
                    <p className="help mb-2">{q.aiRule}</p>

                    <textarea 
                        className="textarea mb-2" rows="4" 
                        value={answers[q.id] || ""}
                        onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    ></textarea>

                    <button 
                        className={`button is-small is-info ${validating[q.id] ? "is-loading" : ""}`}
                        onClick={() => handleValidate(q.id, q.text, q.aiRule)}
                    >
                        <span className="icon"><i className="fas fa-robot"></i></span> <span>Vérifier IA</span>
                    </button>

                    {validations[q.id] && (
                        <div className={`message mt-3 ${validations[q.id].status === "Conforme" ? "is-success" : "is-warning"}`}>
                            <div className="message-body p-3">
                                <strong>{validations[q.id].status}</strong>
                                {validations[q.id].suggestion && <p className="mt-1">💡 {validations[q.id].suggestion}</p>}
                            </div>
                        </div>
                    )}
                </div>
            ))}

            <div className="buttons is-right">
                <button className="button is-light" onClick={() => saveData("Brouillon")}>Sauvegarder Brouillon</button>
                <button className="button is-success" onClick={() => saveData("Soumis")}>Soumettre pour validation</button>
            </div>
        </div>
    );
}
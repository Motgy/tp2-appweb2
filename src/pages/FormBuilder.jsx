import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
export default function FormBuilder() {
    const { formId } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [questions, setQuestions] = useState([
        { id: 1, text: "", aiRule: "" }
    ]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(!!formId);

    useEffect(() => {
        if (formId) {
            const fetchForm = async () => {
                try {
                    const docRef = doc(db, "forms", formId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setTitle(data.title);
                        setQuestions(data.questions || []);
                    } else {
                        alert("Formulaire introuvable");
                        navigate("/admin");
                    }
                } catch (error) {
                    console.error("Erreur chargement:", error);
                } finally {
                    setInitialLoading(false);
                }
            };
            fetchForm();
        }
    }, [formId, navigate]);
    const addQuestion = () => {
        const maxId = questions.length > 0 ? Math.max(...questions.map(q => q.id)) : 0;
        setQuestions([...questions, { id: maxId + 1, text: "", aiRule: "" }]);
    };

    const removeQuestion = (id) => {
        if (questions.length === 1) return;
        setQuestions(questions.filter(q => q.id !== id));
    };

    const handleQuestionChange = (id, field, value) => {
        const updated = questions.map(q =>
            q.id === id ? { ...q, [field]: value } : q
        );
        setQuestions(updated);
    };
    const saveForm = async () => {
        if (!title.trim()) return alert("Le titre est obligatoire");
        if (questions.some(q => !q.text.trim())) return alert("Toutes les questions doivent avoir un texte");

        setLoading(true);
        try {
            const q = query(collection(db, "forms"), where("isActive", "==", true));
            const snapshot = await getDocs(q);

            const updates = snapshot.docs.map(docSnap => {
                if (formId && docSnap.id === formId) return Promise.resolve();
                return updateDoc(docSnap.ref, { isActive: false });
            });

            await Promise.all(updates);

            if (formId) {
                const formRef = doc(db, "forms", formId);
                await updateDoc(formRef, {
                    title,
                    questions,
                    isActive: true,
                    updatedAt: serverTimestamp()
                });
                alert("Formulaire mis à jour et défini comme ACTIF !");
            } else {
                await addDoc(collection(db, "forms"), {
                    title,
                    questions,
                    isActive: true,
                    createdBy: auth.currentUser.uid,
                    createdAt: serverTimestamp()
                });
                alert("Nouveau formulaire créé et activé !");
            }
            navigate("/admin");
        } catch (error) {
            console.error("Erreur:", error);
            alert("Erreur lors de la sauvegarde.");
        }
        setLoading(false);
    };

    if (initialLoading) return <div className="p-5">Chargement du formulaire...</div>;

    return (
        <div className="container mt-5 mb-6">
            <h1 className="title">{formId ? "Modifier le Modèle" : "Créer un Modèle"}</h1>

            <div className="field">
                <label className="label">Titre du formulaire</label>
                <div className="control">
                    <input
                        className="input is-medium"
                        type="text"
                        placeholder="Ex: Plan de cours Hiver 2025"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
            </div>

            <hr />

            <h2 className="subtitle">Questions et Règles IA</h2>

            {questions.map((q, index) => (
                <div key={q.id} className="box" style={{ position: "relative" }}>
                    <span className="tag is-black is-absolute" style={{ position: "absolute", top: -10, left: -10 }}>
                        Question {index + 1}
                    </span>
                    <button
                        className="delete is-medium"
                        style={{ position: "absolute", top: 10, right: 10 }}
                        onClick={() => removeQuestion(q.id)}
                    ></button>

                    <div className="columns">
                        <div className="column is-half">
                            <div className="field">
                                <label className="label">Question</label>
                                <textarea
                                    className="textarea"
                                    rows="2"
                                    placeholder="La question posée à l'enseignant..."
                                    value={q.text}
                                    onChange={(e) => handleQuestionChange(q.id, "text", e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                        <div className="column is-half">
                            <div className="field">
                                <label className="label has-text-info">Règle de validation IA</label>
                                <textarea
                                    className="textarea is-info"
                                    rows="2"
                                    placeholder="Consigne pour l'IA (ex: Doit mentionner X, Y...)"
                                    value={q.aiRule}
                                    onChange={(e) => handleQuestionChange(q.id, "aiRule", e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <button className="button is-fullwidth is-info is-light mb-5" onClick={addQuestion}>
                <span className="icon"><i className="fas fa-plus"></i></span>
                <span>Ajouter une question</span>
            </button>

            <button
                className={`button is-primary is-medium is-fullwidth ${loading ? "is-loading" : ""}`}
                onClick={saveForm}
            >
                {formId ? "Enregistrer les modifications" : "Enregistrer et Activer"}
            </button>
        </div>
    );
}
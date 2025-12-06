import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function AdminPlanList() {
    const [plans, setPlans] = useState([]);
    const [filter, setFilter] = useState("Soumis");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlans = async () => {
            const q = query(collection(db, "plans"), orderBy("updatedAt", "desc"));
            const snapshot = await getDocs(q);
            setPlans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchPlans();
    }, []);

    const filtered = plans.filter(p => filter === "Tous" ? true : p.status === filter);

    return (
        <div className="container mt-5">
            <h1 className="title">Suivi des Plans</h1>
            <div className="tabs is-centered is-toggle">
                <ul>
                    {["Soumis", "Validé", "À corriger", "Tous"].map(status => (
                        <li key={status} className={filter === status ? "is-active" : ""}>
                            <a onClick={() => setFilter(status)}>{status}</a>
                        </li>
                    ))}
                </ul>
            </div>

            <table className="table is-fullwidth is-striped is-hoverable">
                <thead>
                    <tr>
                        <th>Cours</th>
                        <th>Enseignant</th>
                        <th>Statut</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map(p => (
                        <tr key={p.id}>
                            <td>{p.courseCode}</td>
                            <td>{p.teacherName}</td>
                            <td><span className={`tag ${p.status==="Validé"?"is-success":p.status==="Soumis"?"is-info":"is-warning"}`}>{p.status}</span></td>
                            <td>
                                <button className="button is-small is-link" onClick={() => navigate(`/admin/validate/${p.id}`)}>Examiner</button>
                            </td>
                        </tr>
                    ))}
                    {filtered.length === 0 && <tr><td colSpan="4" className="has-text-centered">Aucun plan.</td></tr>}
                </tbody>
            </table>
            <button className="button is-light" onClick={() => navigate("/admin")}>Retour</button>
        </div>
    );
}
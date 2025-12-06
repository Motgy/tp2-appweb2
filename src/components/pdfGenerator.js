import { jsPDF } from "jspdf";
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const generateAndUploadPDF = async (plan, form, teacherName) => {
    try {
        const doc = new jsPDF();
        const lineHeight = 10;
        let y = 20;

        doc.setFontSize(18);
        doc.text("Plan de Cours", 105, y, { align: "center" });
        y += 15;

        doc.setFontSize(12);
        doc.text(`Cours : ${plan.courseCode}`, 20, y);
        y += 10;
        doc.text(`Enseignant : ${teacherName}`, 20, y);
        y += 10;
        doc.text(`Date de soumission : ${new Date().toLocaleDateString()}`, 20, y);
        y += 15;
        
        doc.line(20, y, 190, y);
        y += 15;

        form.questions.forEach((q, index) => {

            if (y > 270) {
                doc.addPage();
                y = 20;
            }

            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            const splitQuestion = doc.splitTextToSize(`${index + 1}. ${q.text}`, 170);
            doc.text(splitQuestion, 20, y);
            y += (splitQuestion.length * 7);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            const answer = plan.answers[q.id] || "Aucune réponse fournie.";
            const splitAnswer = doc.splitTextToSize(answer, 170);
            doc.text(splitAnswer, 20, y);
            y += (splitAnswer.length * 7) + 10;
        });

        const pdfBlob = doc.output("blob");


        // [Nom Enseignant] [Code Cours] [Timestamp].pdf
        const timestamp = Math.floor(Date.now() / 1000);
        const safeName = teacherName.replace(/[^a-z0-9]/gi, '_'); 
        const fileName = `${safeName}_${plan.courseCode}_${timestamp}.pdf`;

        const storageRef = ref(storage, `plans/${fileName}`);
        await uploadBytes(storageRef, pdfBlob);

        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;

    } catch (error) {
        console.error("Erreur génération PDF:", error);
        throw error;
    }
};
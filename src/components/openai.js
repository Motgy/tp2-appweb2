const FUNCTION_URL = "https://us-central1-tp2appweb2-35f8c.cloudfunctions.net/validatePlan";

export const validateAnswerWithAI = async (question, answer, rule) => {
    try {
        const response = await fetch(FUNCTION_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question, answer, rule })
        });

        if (!response.ok) {
            throw new Error(`Erreur serveur: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error("Erreur appel fonction:", error);
        return {
            status: "Erreur",
            points_positifs: [],
            points_a_ameliorer: ["Impossible de contacter le serveur de validation."],
            suggestion: ""
        };
    }
};

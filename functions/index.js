require("dotenv").config();

const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/v2/https");

setGlobalOptions({ maxInstances: 10 })

exports.validatePlan = onRequest(
  {
    cors: ["https://tp2appweb2-35f8c.web.app"],

  },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Méthode non permise" });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    if (!OPENAI_API_KEY) {
      return res.status(500).json({
        error: "Clé API manquante dans .env",
      });
    }

    const { question, answer, rule } = req.body;

    const prompt = `
Tu es un correcteur pédagogique. Analyse la réponse de l'étudiant selon UNE règle précise.

QUESTION : ${question}

RÈGLE À RESPECTER :
${rule}

RÉPONSE DE L'ÉTUDIANT :
${answer}

Analyse de manière structurée :
1. Points positifs : ce qui respecte la règle.
2. Points à améliorer : ce qui ne respecte pas la règle.
3. Suggestion d'amélioration : propose une version plus conforme.

Réponds uniquement en JSON de cette forme :
{
  "status": "OK",
  "points_positifs": ["..."],
  "points_a_ameliorer": ["..."],
  "suggestion": "..."
}
`;

    try {
      const openaiResponse = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
          }),
        }
      );

      if (!openaiResponse.ok) {
        const errorDetails = await openaiResponse.text();
        console.error("OpenAI Error:", errorDetails);
        return res.status(500).json({ error: "Erreur OpenAI" });
      }

      const data = await openaiResponse.json();

      let result;
      try {

        const rawContent = data.choices[0].message.content;
        const cleanContent = rawContent.replace(/```json|```/g, "").trim();
        result = JSON.parse(cleanContent);
      } catch (e) {
        console.error("JSON Parse Error:", e);
        result = {
          status: "Erreur format",
          points_positifs: [],
          points_a_ameliorer: ["Format JSON incorrect renvoyé par l'IA."],
          suggestion: "",
        };
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Erreur serveur:", error);
      return res.status(500).json({
        status: "Erreur",
        points_positifs: [],
        points_a_ameliorer: ["Erreur interne serveur."],
        suggestion: "",
      });
    }
  }
);
const axios = require("axios");

async function bruteForce() {
  console.log(`Démarrage du script bruteForce`);

  for (let i = 0; i < 100; i++) {
    console.log(`Tentative numéro ${i}`);
    try {
      const res = await axios.post(
        "https://localhost:5173/api/login",
        {
          email: "damdiluca14@gmail.com",
          password: `pass${i}`,
        },
        {
          timeout: 3000, // timeout de 3 secondes
        }
      );
      console.log(`Try pass${i}:`, res.data);
    } catch (err) {
      if (err.response) {
        console.log(
          `❌ pass${i} :`,
          err.response.status,
          err.response.data?.message
        );
      } else {
        console.log(`⛔ pass${i} : Erreur réseau ou serveur`, err.message);
      }
    }
  }
}

bruteForce();

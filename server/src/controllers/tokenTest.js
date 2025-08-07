// import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";

// const JWT_SECRET = process.env.JWT_SECRET || "secret";

// const MOCK_PASSWORD = "monmotdepasse";
// let mockPasswordHash;

// (async () => {
//   mockPasswordHash = await bcrypt.hash(MOCK_PASSWORD, 10);
// })();

// export async function login(req, res) {
//   console.log("Requête login reçue:", req.body);

//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ message: "Tous les champs sont requis" });
//     }

//     const mockUser = {
//       _id: "123456789abcdef",
//       email: "test@example.com",
//       passwordHash: mockPasswordHash,
//       role: "user",
//       isVerified: true,
//     };

//     if (email !== mockUser.email) {
//       return res.status(400).json({ message: "Utilisateur introuvable" });
//     }

//     const isMatch = await bcrypt.compare(password, mockUser.passwordHash);
//     if (!isMatch) {
//       return res
//         .status(400)
//         .json({ message: "Email ou mot de passe incorrect" });
//     }

//     const token = jwt.sign(
//       { id: mockUser._id, role: mockUser.role, email: mockUser.email },
//       JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     return res.json({
//       message: "Connexion réussie",
//       user: {
//         id: mockUser._id,
//         role: mockUser.role,
//         email: mockUser.email,
//       },
//       token,
//     });
//   } catch (error) {
//     console.error("Erreur login:", error);
//     return res.status(500).json({ message: "Erreur serveur" });
//   }
// }

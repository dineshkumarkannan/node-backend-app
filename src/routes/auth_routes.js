import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prismaClient.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // Hash passwords before storing them; never store plaintext passwords.
  const hashedPassword = bcrypt.hashSync(password, 8);

  try {
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    // Give each newly registered user an initial todo.
    const defaultTodo = `Hello, Added default task!`;

    await prisma.todos.create({
      data: {
        task: defaultTodo,
        user_id: user.id,
      },
    });

    // Return a JWT so the client can access protected todo routes.
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.sendStatus(503);
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Look up the stored password hash for this username.
    // const getUser = db.prepare(`SELECT * FROM users WHERE username = ?`);
    // const user = getUser.get(username);

    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (!user) {
      return res.status(404).send({
        message: "User not found",
      });
    }

    // Compare the submitted password with the stored hash.
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).send({
        message: "Invalid password",
      });
    }

    // Issue a token containing only the user's identifier.
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.sendStatus(503);
  }
});

export default router;

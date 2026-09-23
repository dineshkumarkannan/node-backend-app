import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/", (req, res) => {
  // Only return todos belonging to the authenticated user.
  const getTodos = db.prepare(`SELECT * FROM todos WHERE user_id = ?`);
  const todos = getTodos.all(req.userId);
  res.json(todos);
});

router.post("/", (req, res) => {
  const { task } = req.body;

  // Store the authenticated user's ID with every new todo.
  const insertTodo = db.prepare(
    `INSERT INTO todos (user_id, task) VALUES (?, ?)`,
  );
  const result = insertTodo.run(req.userId, task);
  res.status(201).json({ id: result.lastInsertRowid, task, completed: 0 });
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { completed: status } = req.body;
  const { userId } = req;

  // The owner check prevents one user from changing another user's todo.
  const updatedTodo = db.prepare(
    `UPDATE todos SET status = ? WHERE id = ? AND user_id = ?`,
  );
  updatedTodo.run(status, id, userId);
  res.json({ message: "update successfully" });
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const { userId } = req;

  // Delete only when both the todo ID and owner ID match.
  const deletedTodo = db.prepare(
    `DELETE FROM todos WHERE id = ? AND user_id = ?`
  );
  deletedTodo.run(id, userId);

  res.json({ message: "task deleted successfully"})
});

export default router;

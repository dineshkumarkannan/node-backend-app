import express from "express";
import prisma from "../prismaClient.js";

const router = express.Router();

router.get("/", async (req, res) => {
  // Only return todos belonging to the authenticated user.
  const todos = await prisma.todos.findMany({
    where: {
      user_id: req.userId
    }
  })

  res.json(todos);
});

router.post("/", async (req, res) => {
  const { task } = req.body;
  // Store the authenticated user's ID with every new todo.
  const todo = await prisma.todos.create({
    data: {
      task,
      user_id: req.userId
    }
  })
  res.status(201).json(todo);
});

router.put("/:id", async(req, res) => {
  const { id } = req.params;
  const { completed: status } = req.body;
  const { userId } = req;
  // The owner check prevents one user from changing another user's todo.

  const updatedTodo = await prisma.todos.update({
    where: {
      id: parseInt(id),
      user_id: userId
    },
    data: {
      status: !!status
    }
  })

  res.json(updatedTodo);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { userId } = req;

  // Delete only when both the todo ID and owner ID match.
  await prisma.todos.delete({
     where: {
      id: parseInt(id),
      user_id: userId
    }
  })

  res.json({ message: "task deleted successfully"})
});

export default router;

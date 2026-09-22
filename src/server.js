const express = require("express");
const app = express();
const PORT = 8383;

let data = [
  {
    id: 1,
    name: "test",
    value: "test",
  },
];

app.use(express.json());

app.get("/health", (req, res) => {
  res.send("Node Backend app begins!");
});

app.get("/api/items", (req, res) => {
  res.status(200).json(data);
});

app.post("/api/items", (req, res) => {
  const new_data = req.body;
  new_data["id"] = data.length + 1;
  data.push(new_data);
  res.status(201).send(new_data);
});

app.put("/api/items/:id", (req, res) => {
  const query_id = req.params.id;
  data = data.map((val) => {
    if (val.id === +query_id) {
      val.name = req?.body?.name ?? val.name;
      val.value = req?.body?.value ?? val.value;
    }
    return val;
  });
  res.status(200).send(data);
});

app.delete("/api/items/:id", (req, res) => {
  const query_id = req.params.id;
  res.status(204);
});

// URL : http://localhost:8383
app.listen(PORT, "0.0.0.0", () => {
  console.log(`App connected on port: ${PORT}`);
});

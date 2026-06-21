const repositoryRoutes = require("./routes/repositoryRoutes");
const authRoutes = require("./routes/authRoutes");
const connectDB = require("./config/db");
const express = require("express");
const cors = require("cors");
const fileRoutes = require("./routes/fileRoutes");

const folderRoutes = require("./routes/folderRoutes");

require("dotenv").config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "DevSync API is running...",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/repositories", repositoryRoutes);
app.use("/api/files", fileRoutes);

app.use("/api/folders", folderRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
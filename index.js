import express from "express";
import multer from "multer";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 10000;

// File upload setup
const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
  res.send("🎵 Instrument Splitter API is running!");
});

// Upload + process route
app.post("/split", upload.single("audio"), async (req, res) => {
  try {
    const inputPath = path.join(__dirname, req.file.path);
    const outputDir = path.join(__dirname, "separated");

    // Ensure output dir
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    // Run Python Demucs script
    execSync(`python3 demucs_runner.py "${inputPath}" "${outputDir}"`, { stdio: "inherit" });

    // Find separated stems
    const stems = fs.readdirSync(outputDir).map(f => ({
      file: f,
      url: `https://${req.headers.host}/stems/${f}`
    }));

    res.json({ success: true, stems });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// Serve output stems
app.use("/stems", express.static("separated"));

// Keep-alive endpoint (for Render uptime)
app.get("/ping", (req, res) => res.send("pong"));

app.listen(port, () => console.log(`Server running on port ${port}`));

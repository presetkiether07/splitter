import express from "express";
import multer from "multer";
import path from "path";
import { execSync } from "child_process";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = process.env.PORT || 10000;

// Static files
app.use(express.static("public"));
app.use("/stems", express.static("separated"));
app.set("view engine", "html");
app.engine("html", (_, options, cb) =>
  fs.readFile(options.filename, "utf-8", cb)
);
app.set("views", path.join(__dirname, "views"));

// Main page
app.get("/", (req, res) => res.render("index.html"));

// Handle upload
app.post("/upload", upload.single("audio"), (req, res) => {
  const inputPath = path.join(__dirname, req.file.path);
  const outputDir = path.join(__dirname, "separated");

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  try {
    execSync(`python3 demucs_runner.py "${inputPath}" "${outputDir}"`, { stdio: "inherit" });

    const stems = fs.readdirSync(outputDir).map(f => ({
      name: f,
      url: `/stems/${f}`
    }));

    // return HTML page with download links
    const list = stems.map(s => `<li><a href="${s.url}" download>${s.name}</a></li>`).join("");
    res.send(`
      <h2>✅ Split Complete!</h2>
      <ul>${list}</ul>
      <a href="/">⬅ Back</a>
    `);
  } catch (err) {
    console.error(err);
    res.send(`<h2>❌ Error:</h2><pre>${err.message}</pre><a href="/">⬅ Back</a>`);
  }
});

app.listen(PORT, () => console.log(`App running on port ${PORT}`));

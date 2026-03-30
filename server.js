const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();

app.use(express.json());
app.use(express.static('public')); // Serves the HTML file
app.use('/uploads', express.static('uploads'));

const DB_PATH = path.join(__dirname, 'data', 'db.json');

// Ensure database and folders exist
if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'));
if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({products:[], repairs:[], customers:[]}, null, 2));

const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// Image Upload Logic
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const type = req.params.type || 'general';
        const p = `./uploads/${type}`;
        if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
        cb(null, p);
    },
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// API Routes
app.get('/api/data', (req, res) => res.json(readDB()));

app.post('/api/:type', upload.single('image'), (req, res) => {
    const { type } = req.params;
    const db = readDB();
    const newItem = {
        id: Date.now().toString(),
        ...req.body,
        image: req.file ? `/uploads/${type}/${req.file.filename}` : 'https://via.placeholder.com/150'
    };
    db[type].push(newItem);
    writeDB(db);
    res.json(newItem);
});

app.delete('/api/:type/:id', (req, res) => {
    const { type, id } = req.params;
    const db = readDB();
    db[type] = db[type].filter(i => String(i.id) !== String(id));
    writeDB(db);
    res.sendStatus(200);
});

app.listen(3000, () => console.log("🚀 TechNinja Pro Live: http://localhost:3000"));
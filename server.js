const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();

app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const DB_PATH = path.join(__dirname, 'data', 'db.json');

// Ensure Folders Exist
if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'));
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({
        products: [], repairs: [], settings: { shopName: "Tech Ninja", currency: "Rs", logo: "./image/logo.jpg" },
        user: { username: "admin", password: "123" }
    }, null, 2));
}

const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const p = `./uploads/${req.params.type || 'general'}`;
        if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
        cb(null, p);
    },
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// AUTH
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const db = readDB();
    if (db.user && username === db.user.username && password === db.user.password) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});

// GET ALL DATA
app.get('/api/data', (req, res) => res.json(readDB()));

// SETTINGS UPDATE (Handles Logo Upload)
app.post('/api/settings', upload.single('logo'), (req, res) => {
    const db = readDB();
    db.settings.shopName = req.body.shopName || db.settings.shopName;
    db.settings.currency = req.body.currency || db.settings.currency;
    if (req.file) db.settings.logo = `/uploads/general/${req.file.filename}`;
    if (req.body.newPassword) db.user.password = req.body.newPassword;
    writeDB(db);
    res.json({ success: true });
});

// ADD ITEM (Products or Repairs)
app.post('/api/:type', upload.single('image'), (req, res) => {
    const { type } = req.params;
    const db = readDB();
    const isDup = db[type].some(i => (i.name || i.device) === (req.body.name || req.body.device));
    if (isDup) return res.status(400).json({ error: "Duplicate Entry" });

    const newItem = { 
        id: Date.now().toString(), 
        ...req.body, 
        image: req.file ? `/uploads/${type}/${req.file.filename}` : 'https://via.placeholder.com/50' 
    };
    db[type].push(newItem);
    writeDB(db);
    res.json(newItem);
});

// DELETE ITEM + IMAGE
app.delete('/api/:type/:id', (req, res) => {
    const { type, id } = req.params;
    const db = readDB();
    const idx = db[type].findIndex(i => i.id === id);
    if (idx !== -1) {
        const item = db[type][idx];
        if (item.image && item.image.startsWith('/uploads')) {
            const filePath = path.join(__dirname, item.image.replace(/^\//, ''));
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        db[type].splice(idx, 1);
        writeDB(db);
        res.sendStatus(200);
    } else res.status(404).send("Not found");
});

app.listen(3000, () => console.log("🚀 Server: http://localhost:3000"));
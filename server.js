const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();

app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const DB_PATH = path.join(__dirname, 'data', 'db.json');

if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'));
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({
        products: [], repairs: [], settings: { shopName: "TechNinja Pro", currency: "Rs" },
        user: { username: "admin", password: "123" }
    }, null, 2));
}

const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const p = path.join(__dirname, 'uploads', req.params.type || 'general');
        if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
        cb(null, p);
    },
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const db = readDB();
    if (db.user && username === db.user.username && password === db.user.password) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});

app.get('/api/data', (req, res) => res.json(readDB()));

app.post('/api/settings', (req, res) => {
    const db = readDB();
    db.settings = { ...db.settings, ...req.body };
    if (req.body.newPassword && req.body.newPassword.trim() !== "") {
        db.user.password = req.body.newPassword;
    }
    writeDB(db);
    res.json({ success: true });
});

app.post('/api/:type', upload.single('image'), (req, res) => {
    const { type } = req.params;
    const db = readDB();
    
    // Idempotency check: prevent duplicate names in the same session
    const isDup = db[type].find(i => i.name === req.body.name && type === 'products');
    if(isDup) return res.status(409).json({error: "Duplicate"});

    const newItem = { 
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5), 
        ...req.body, 
        image: req.file ? `/uploads/${type}/${req.file.filename}` : 'https://via.placeholder.com/50' 
    };
    db[type].push(newItem);
    writeDB(db);
    res.json(newItem);
});

app.delete('/api/:type/:id', (req, res) => {
    const { type, id } = req.params;
    const db = readDB();
    const idx = db[type].findIndex(i => String(i.id) === String(id));
    
    if (idx !== -1) {
        const item = db[type][idx];
        if (item.image && item.image.startsWith('/uploads')) {
            const filePath = path.join(__dirname, item.image);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        db[type].splice(idx, 1);
        writeDB(db);
        res.sendStatus(200);
    } else {
        res.status(404).send("Not found");
    }
});

app.listen(3000, () => console.log("🚀 Server running at http://localhost:3000"));
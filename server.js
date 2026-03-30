const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();

app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const DB_PATH = path.join(__dirname, 'data', 'db.json');

// Initialize DB structure
if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'));
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({
        products: [], repairs: [], customers: [], 
        settings: { shopName: "TechNinja Pro", currency: "$" }
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

// ROUTES
app.get('/api/data', (req, res) => res.json(readDB()));

app.post('/api/settings', (req, res) => {
    const db = readDB();
    db.settings = { ...db.settings, ...req.body };
    writeDB(db);
    res.json({ success: true, settings: db.settings });
});

app.post('/api/:type', upload.single('image'), (req, res) => {
    const { type } = req.params;
    const db = readDB();

    // IDEMPOTENCY CHECK: Prevent exact duplicates if saving quickly
    const isDuplicate = db[type].find(item => 
        (item.name === req.body.name || item.device === req.body.device) && 
        item.customer === req.body.customer
    );
    if (isDuplicate) return res.status(409).json({ error: "Duplicate entry detected" });

    const newItem = {
        // Unique ID combination to prevent collisions
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
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

app.listen(3000, () => console.log("🚀 TechNinja Live: http://localhost:3000"));
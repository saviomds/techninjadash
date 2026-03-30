const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();

app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const DB_PATH = path.join(__dirname, 'data', 'db.json');

// INIT DB
const initDB = () => {
    if (!fs.existsSync(path.join(__dirname, 'data'))) {
        fs.mkdirSync(path.join(__dirname, 'data'));
    }

    if (!fs.existsSync(DB_PATH)) {
        const initialData = {
            products: [],
            repairs: [],
            orders: [],
            customers: [],
            staff: [],
            settings: { shopName: "Tech Ninja Pro", currency: "Rs", logo: "/image/logo.jpg" },
            user: { username: "admin", password: "123" }
        };
        fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
    }
};
initDB();

// SAFE READ
const readDB = () => {
    try {
        return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    } catch (err) {
        console.error("DB Error:", err);
        return {
            products: [], repairs: [], orders: [], customers: [], staff: [],
            settings: { shopName: "Tech Ninja", currency: "Rs", logo: "/image/logo.jpg" },
            user: { username: "admin", password: "123" }
        };
    }
};

// ENSURE STRUCTURE
const ensureStructure = (db) => ({
    products: db.products || [],
    repairs: db.repairs || [],
    orders: db.orders || [],
    customers: db.customers || [],
    staff: db.staff || [],
    settings: db.settings || { shopName: "Tech Ninja", currency: "Rs", logo: "/image/logo.jpg" },
    user: db.user || { username: "admin", password: "123" }
});

const writeDB = (data) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

// UPLOAD
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const type = req.params.type || 'general';
        const dir = path.join(__dirname, 'uploads', type);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// LOGIN
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const db = readDB();

    if (username === db.user.username && password === db.user.password) {
        return res.json({ success: true });
    }
    res.status(401).json({ success: false });
});

// GET DATA
app.get('/api/data', (req, res) => {
    const db = ensureStructure(readDB());
    res.json(db);
});

// SETTINGS
app.post('/api/settings', upload.single('logo'), (req, res) => {
    const db = readDB();
    const { shopName, currency, password } = req.body;

    if (shopName) db.settings.shopName = shopName;
    if (currency) db.settings.currency = currency;
    if (password) db.user.password = password;

    if (req.file) {
        db.settings.logo = `/uploads/general/${req.file.filename}`;
    }

    writeDB(db);
    res.json({ success: true });
});

// CREATE
app.post('/api/:type', upload.single('image'), (req, res) => {
    const { type } = req.params;
    const db = readDB();

    if (!db[type] || !Array.isArray(db[type])) {
        return res.status(404).json({ error: "Invalid type" });
    }

    const newItem = {
        id: "TN-" + Math.floor(1000 + Math.random() * 9000),
        name: req.body.name || req.body.device || "Unnamed",
        ...req.body,
        date: new Date().toLocaleDateString(),
        image: req.file ? `/uploads/${type}/${req.file.filename}` : 'https://via.placeholder.com/50'
    };

    db[type].push(newItem);
    writeDB(db);
    res.json(newItem);
});

// DELETE
app.delete('/api/:type/:id', (req, res) => {
    const { type, id } = req.params;
    const db = readDB();

    const item = db[type]?.find(i => i.id === id);

    if (item && item.image && !item.image.startsWith('http')) {
        const imgPath = path.join(__dirname, item.image.replace(/^\//, ''));
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    db[type] = db[type].filter(i => i.id !== id);
    writeDB(db);

    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
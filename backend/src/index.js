const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

// Admin credentials
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
    const { username, password } = req.body;
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        next();
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
};

// Admin login route
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        res.json({ 
            message: 'Login successful',
            isAdmin: true
        });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
        }
    }
});

// Initialize SQLite database
const dbPath = path.join(dataDir, 'reports.db');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
        process.exit(1); // Exit if we can't connect to the database
    } else {
        console.log('Connected to SQLite database');
        // Create reports table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS reports (
            id TEXT PRIMARY KEY,
            issue_type TEXT NOT NULL,
            description TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            photo_path TEXT,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating table:', err);
                process.exit(1);
            } else {
                console.log('Reports table ready');
            }
        });
    }
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!' });
});

// Add this function before the routes
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
}

// Routes
app.post('/api/reports', upload.single('photo'), (req, res) => {
    console.log('Received report submission:', req.body);
    const { issue_type, description, latitude, longitude } = req.body;
    const id = uuidv4();
    const photo_path = req.file ? `/uploads/${req.file.filename}` : null;

    const sql = `INSERT INTO reports (id, issue_type, description, latitude, longitude, photo_path)
                 VALUES (?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [id, issue_type, description, latitude, longitude, photo_path], function(err) {
        if (err) {
            console.error('Error inserting report:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        console.log('Report created successfully:', id);
        res.status(201).json({ 
            id,
            message: 'Report created successfully',
            photo_path
        });
    });
});

app.get('/api/reports', (req, res) => {
    console.log('Fetching all reports');
    db.all('SELECT * FROM reports ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            console.error('Error fetching reports:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        console.log(`Found ${rows.length} reports`);
        res.json(rows);
    });
});

app.get('/api/reports/:id', (req, res) => {
    console.log('Fetching report:', req.params.id);
    db.get('SELECT * FROM reports WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            console.error('Error fetching report:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            console.log('Report not found:', req.params.id);
            res.status(404).json({ error: 'Report not found' });
            return;
        }
        console.log('Report found:', row);
        res.json(row);
    });
});

app.put('/api/reports/:id', authenticateAdmin, (req, res) => {
    console.log('Updating report:', req.params.id, req.body);
    const { status } = req.body;
    const sql = `UPDATE reports SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    db.run(sql, [status, req.params.id], function(err) {
        if (err) {
            console.error('Error updating report:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            console.log('Report not found for update:', req.params.id);
            res.status(404).json({ error: 'Report not found' });
            return;
        }
        console.log('Report updated successfully:', req.params.id);
        res.json({ message: 'Report updated successfully' });
    });
});

// Add this new route after the existing routes
app.get('/api/reports/nearby', (req, res) => {
    const { latitude, longitude, radius = 1 } = req.query; // radius in kilometers, default 1km
    
    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    console.log('Finding reports near:', latitude, longitude, 'within', radius, 'km');
    
    db.all('SELECT * FROM reports', [], (err, rows) => {
        if (err) {
            console.error('Error fetching reports:', err);
            res.status(500).json({ error: err.message });
            return;
        }

        // Filter reports by distance
        const nearbyReports = rows.filter(report => {
            const distance = calculateDistance(
                parseFloat(latitude),
                parseFloat(longitude),
                parseFloat(report.latitude),
                parseFloat(report.longitude)
            );
            report.distance = distance; // Add distance to each report
            return distance <= parseFloat(radius);
        });

        // Sort by distance
        nearbyReports.sort((a, b) => a.distance - b.distance);

        console.log(`Found ${nearbyReports.length} reports within ${radius}km`);
        res.json(nearbyReports);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ error: err.message });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Test the server at: http://localhost:${port}/api/test`);
}); 
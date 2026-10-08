const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();
const API_BASE_URL = 'http://127.0.0.1:5000/api';

// Import Mongoose Models
const User = require('./models/User');
const Member = require('./models/Member');
const Notice = require('./models/Notice');
const Event = require('./models/Event');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'ndsc_jwt_secret_fallback_key_2026';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ndsc_db';

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());

// Serve static frontend files from current directory
app.use(express.static(__dirname));

// ==================== DATABASE CONNECTION & SEEDING ====================
mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB successfully.');
        await seedInitialData();
    })
    .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err.message);
        console.log('⚠️ Running in fallback mode. Ensure MongoDB is running locally or Atlas URI is set in .env');
    });

// Helper: Seed Default Admin & Sample Data if collections are empty
async function seedInitialData() {
    try {
        // 1. Seed Default Admin
        const adminUsername = (process.env.DEFAULT_ADMIN_USERNAME || 'admin').toLowerCase();
        const existingAdmin = await User.findOne({
            $or: [
                { username: adminUsername },
                { role: 'admin' },
                { role: 'superadmin' }
            ]
        });
        if (!existingAdmin) {
            const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(defaultPassword, salt);
            const defaultEmail = (process.env.ADMIN_EMAIL || 'admin@ndsc.mbstu.ac.bd').toLowerCase();
            await User.create({
                name: 'Council Administrator',
                username: adminUsername,
                email: defaultEmail,
                password: hashedPassword,
                role: 'admin',
                status: 'approved',
                department: 'ICT',
                session: 'Executive',
                upazila: 'Narsingdi Sadar',
                phone: '01962382455',
                whatsapp: '01962382455'
            });
            console.log(`👤 Default admin created -> Username: ${adminUsername} | Email: ${defaultEmail} | Password: ${defaultPassword}`);
        }

        // Rule: Default existing DB users and members to 'approved'
        await User.updateMany({ status: { $exists: false } }, { $set: { status: 'approved' } });
        await Member.updateMany({ status: { $exists: false } }, { $set: { status: 'approved' } });
        await User.updateMany(
            { role: { $in: ['admin', 'superadmin'] }, status: { $ne: 'approved' } },
            { $set: { status: 'approved' } }
        );

        // 2. Seed Initial Members if collection is empty
        const memberCount = await Member.countDocuments();
        if (memberCount === 0) {
            const initialMembers = [
                { name: "Udoy Saha", department: "BMB", session: "2020-2021", upazila: "Monohardi", phone: "01718583244", whatsapp: "01718583244" },
                { name: "Niloy Paul", department: "BGE", session: "2020-2021", upazila: "Raipura", phone: "01619653550", whatsapp: "01619653550" },
                { name: "Ashraful Islam Jakir", department: "ICT", session: "2021-2022", upazila: "Belabo", phone: "01859667793", whatsapp: "01859667793" },
                { name: "Monirojjaman Ayoive", department: "ICT", session: "2022-2023", upazila: "Monohardi", phone: "01962382455", whatsapp: "01962382455" },
                { name: "Tahmid Hossain", department: "CSE", session: "2021-2022", upazila: "Shibpur", phone: "01711223344", whatsapp: "01711223344" },
                { name: "Sadia Sultana", department: "Pharmacy", session: "2022-2023", upazila: "Narsingdi Sadar", phone: "01822334455", whatsapp: "01822334455" },
                { name: "Mahfuzur Rahman", department: "ESRM", session: "2020-2021", upazila: "Palash", phone: "01933445566", whatsapp: "01933445566" },
                { name: "Rifat Ahmed", department: "TE", session: "2023-2024", upazila: "Raipura", phone: "01744556677", whatsapp: "01744556677" }
            ];
            await Member.insertMany(initialMembers);
            console.log(`📋 Seeded ${initialMembers.length} initial council members.`);
        }

        // 3. Seed Initial Notices if collection is empty
        const noticeCount = await Notice.countDocuments();
        if (noticeCount === 0) {
            const initialNotices = [
                {
                    title: "Emergency Meeting Regarding Freshers' Ceremony",
                    category: "NOTICE",
                    date: "2026-07-12",
                    content: "All Executive Committee members are requested to attend an emergency meeting on July 15, 2026, at 5:00 PM at the Teacher-Student Center (TSC) corridor. Agenda: Budget finalization and guest selection for the Freshers' Reception & Farewell.",
                    isActive: true
                },
                {
                    title: "Narsingdi District Student Council Wins Inter-District Cricket Championship!",
                    category: "NEWS",
                    date: "2025-12-10",
                    content: "In a spectacular final, Narsingdi Student Council defeated Gazipur Student Council by 5 wickets to lift the MBSTU Inter-District Cricket Trophy. Ashraful Islam Jakir was named Player of the Tournament for his outstanding all-round performance.",
                    isActive: true
                },
                {
                    title: "Winter Relief & Blanket Distribution Drive in Narsingdi",
                    category: "NOTICE",
                    date: "2025-11-20",
                    content: "Our voluntary social development wing successfully distributed over 350 warm blankets and clothing sets to underprivileged winter victims across Monohardi and Belabo upazilas. Heartfelt thanks to all our donors.",
                    isActive: true
                }
            ];
            await Notice.insertMany(initialNotices);
            console.log(`📢 Seeded ${initialNotices.length} initial notices.`);
        }

        // 4. Seed Initial Events if collection is empty
        const eventCount = await Event.countDocuments();
        if (eventCount === 0) {
            const initialEvents = [
                {
                    title: "Freshers' Reception & Farewell 2025",
                    type: "Upcoming",
                    date: "2025-11-08",
                    location: "MBSTU Multipurpose Bldg",
                    description: "The grand annual ceremony organized by the Narsingdi District Student Council, MBSTU. The event welcomes new students from Narsingdi district and bids farewell to our graduating seniors. Features a discussion panel, lunch feast, and an engaging cultural night showcasing district talents."
                },
                {
                    title: "Annual District Picnic & River Cruise 2024",
                    type: "Completed",
                    date: "2024-02-17",
                    location: "Meghna Riverfront, Raipura",
                    description: "An unforgettable day of fellowship, boating, district traditional feast, and cultural bonding with over 150 members and alumni from across all 6 upazilas."
                },
                {
                    title: "Inter-District Friendly Football Clash",
                    type: "Completed",
                    date: "2024-06-21",
                    location: "MBSTU Central Playground",
                    description: "A friendly inter-district sports tournament fostering camaraderie and physical wellness among students from various districts studying at MBSTU."
                }
            ];
            await Event.insertMany(initialEvents);
            console.log(`🎉 Seeded ${initialEvents.length} initial events.`);
        }
    } catch (seedErr) {
        console.error('Error during data seeding:', seedErr.message);
    }
}

// ==================== AUTHENTICATION & ROLE MIDDLEWARES ====================

/**
 * JWT Authentication Middleware
 * Validates Bearer token from Authorization header
 */
const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Access denied. No authentication token provided.'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            error: 'Invalid or expired token. Please log in again.'
        });
    }
};

/**
 * Admin Role Middleware
 * Enforces admin role check for protected administrative endpoints
 */
const verifyAdmin = (req, res, next) => {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
        return res.status(403).json({
            success: false,
            error: 'Access denied. Administrator privileges required.'
        });
    }
    next();
};

// Aliases for compatibility
const isAdmin = verifyAdmin;
const authenticateAdmin = [verifyToken, verifyAdmin];

// ==================== AUTHENTICATION ROUTES ====================

/**
 * POST /api/auth/register (and alias /api/users/register)
 * Creates account with hashed password using bcrypt (role: user)
 */
const registerHandler = async (req, res) => {
    try {
        const { name, department, session, phone, email, password, upazila, whatsapp } = req.body;

        // Validation of required fields
        if (!name || !department || !session || !phone || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please fill in all required fields (Name, Department, Session, Phone, Email, Password).'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid email address.'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters long.'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'An account with this email address already exists. Please log in.'
            });
        }

        // Hash password with bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: 'user',
            department: department.trim(),
            session: session.trim(),
            phone: phone.trim(),
            upazila: upazila ? upazila.trim() : '',
            whatsapp: whatsapp ? whatsapp.trim() : phone.trim(),
            profilePicture: ''
        });

        return res.status(201).json({
            success: true,
            message: 'Registration successful! You can now log in to your account.',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                department: newUser.department,
                session: newUser.session,
                phone: newUser.phone,
                upazila: newUser.upazila,
                whatsapp: newUser.whatsapp
            }
        });
    } catch (err) {
        console.error('Error in register:', err);
        return res.status(500).json({ success: false, error: 'Registration failed due to a server error.' });
    }
};

app.post('/api/auth/register', registerHandler);
app.post('/api/users/register', registerHandler);

/**
 * POST /api/auth/login (and alias /api/users/login)
 * Verifies credentials (email/username + password) and returns JWT
 */
const loginHandler = async (req, res) => {
    try {
        const identifier = req.body.email || req.body.username || req.body.identifier;
        const password = req.body.password;

        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide both email/username and password.'
            });
        }

        const normalizedInput = identifier.toLowerCase().trim();
        const user = await User.findOne({
            $or: [
                { email: normalizedInput },
                { username: normalizedInput }
            ]
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password.'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password.'
            });
        }

        // Generate JWT Token (valid for 24 hours)
        const token = jwt.sign(
            {
                id: user._id,
                name: user.name,
                email: user.email,
                username: user.username || user.name,
                role: user.role,
                department: user.department,
                session: user.session,
                phone: user.phone
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            success: true,
            message: 'Authentication successful.',
            token,
            user: {
                id: user._id,
                name: user.name || user.username || 'User',
                email: user.email,
                username: user.username,
                role: user.role || 'user',
                department: user.department || '',
                session: user.session || '',
                upazila: user.upazila || '',
                phone: user.phone || '',
                whatsapp: user.whatsapp || user.phone || '',
                profilePicture: user.profilePicture || ''
            }
        });
    } catch (err) {
        console.error('Error in login:', err);
        return res.status(500).json({ success: false, error: 'Internal server error.' });
    }
};

app.post('/api/auth/login', loginHandler);
app.post('/api/users/login', loginHandler);

/**
 * GET /api/auth/me (and alias /api/users/me, /api/auth/verify)
 * Protected: Retrieves current authenticated user profile
 */
const getMeHandler = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, error: 'User profile not found.' });
        }
        return res.status(200).json({
            success: true,
            user
        });
    } catch (err) {
        console.error('Error in getMe:', err);
        return res.status(500).json({ success: false, error: 'Failed to retrieve profile.' });
    }
};

app.get('/api/auth/me', verifyToken, getMeHandler);
app.get('/api/users/me', verifyToken, getMeHandler);
app.get('/api/auth/verify', verifyToken, getMeHandler);

/**
 * PUT /api/auth/me (and alias /api/users/me)
 * Protected: Updates current authenticated user profile
 */
const updateMeHandler = async (req, res) => {
    try {
        const { name, department, session, upazila, phone, whatsapp, profilePicture } = req.body;
        const allowedUpdates = {};

        if (name !== undefined) allowedUpdates.name = name.trim();
        if (department !== undefined) allowedUpdates.department = department.trim();
        if (session !== undefined) allowedUpdates.session = session.trim();
        if (upazila !== undefined) allowedUpdates.upazila = upazila.trim();
        if (phone !== undefined) allowedUpdates.phone = phone.trim();
        if (whatsapp !== undefined) allowedUpdates.whatsapp = whatsapp.trim();
        if (profilePicture !== undefined) allowedUpdates.profilePicture = profilePicture.trim();

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            allowedUpdates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ success: false, error: 'User not found.' });
        }

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully.',
            user: updatedUser
        });
    } catch (err) {
        console.error('Error in updateMe:', err);
        return res.status(500).json({ success: false, error: 'Failed to update profile.' });
    }
};

app.put('/api/auth/me', verifyToken, updateMeHandler);
app.put('/api/users/me', verifyToken, updateMeHandler);

/**
 * GET /api/users
 * Protected (Admin only): Retrieves all registered student accounts
 */
app.get('/api/users', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (err) {
        console.error('Error in GET /api/users:', err);
        return res.status(500).json({ success: false, error: 'Failed to retrieve users.' });
    }
});

// ==================== 2. MEMBER ROUTES ====================

/**
 * GET /api/members
 * Supports query filters: upazila, department, session, search/q
 */
app.get('/api/members', async (req, res) => {
    try {
        const { upazila, department, session, search, q } = req.query;
        const filter = {};

        if (upazila) {
            filter.upazila = new RegExp(`^${upazila.trim()}$`, 'i');
        }
        if (department) {
            filter.department = new RegExp(`^${department.trim()}$`, 'i');
        }
        if (session) {
            filter.session = session.trim();
        }

        const searchQuery = (search || q || '').trim();
        if (searchQuery) {
            const regex = new RegExp(searchQuery, 'i');
            filter.$or = [
                { name: regex },
                { department: regex },
                { upazila: regex },
                { session: regex },
                { phone: regex }
            ];
        }

        const members = await Member.find(filter).sort({ session: -1, name: 1 });
        return res.status(200).json({
            success: true,
            count: members.length,
            data: members
        });
    } catch (err) {
        console.error('Error in GET /api/members:', err);
        return res.status(500).json({ success: false, error: 'Failed to retrieve members.' });
    }
});

/**
 * POST /api/members (Protected - Admin only)
 * Adds a new member to the directory
 */
app.post('/api/members', authenticateAdmin, async (req, res) => {
    try {
        const { name, department, session, upazila, phone, whatsapp } = req.body;

        if (!name || !department || !session || !upazila || !phone) {
            return res.status(400).json({
                success: false,
                error: 'Fields: name, department, session, upazila, and phone are required.'
            });
        }

        const newMember = await Member.create({
            name: name.trim(),
            department: department.trim(),
            session: session.trim(),
            upazila: upazila.trim(),
            phone: phone.trim(),
            whatsapp: whatsapp ? whatsapp.trim() : phone.trim()
        });

        return res.status(201).json({
            success: true,
            message: 'Member added successfully.',
            data: newMember
        });
    } catch (err) {
        console.error('Error in POST /api/members:', err);
        return res.status(500).json({ success: false, error: 'Failed to add member.' });
    }
});

/**
 * PUT /api/members/:id (Protected - Admin only)
 * Updates member information
 */
app.put('/api/members/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updatedMember = await Member.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });

        if (!updatedMember) {
            return res.status(404).json({ success: false, error: 'Member not found.' });
        }

        return res.status(200).json({
            success: true,
            message: 'Member updated successfully.',
            data: updatedMember
        });
    } catch (err) {
        console.error('Error in PUT /api/members/:id:', err);
        return res.status(500).json({ success: false, error: 'Failed to update member.' });
    }
});

/**
 * DELETE /api/members/:id (Protected - Admin only)
 * Deletes a member from the directory
 */
app.delete('/api/members/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const deletedMember = await Member.findByIdAndDelete(id);

        if (!deletedMember) {
            return res.status(404).json({ success: false, error: 'Member not found.' });
        }

        return res.status(200).json({
            success: true,
            message: 'Member deleted successfully.',
            id
        });
    } catch (err) {
        console.error('Error in DELETE /api/members/:id:', err);
        return res.status(500).json({ success: false, error: 'Failed to delete member.' });
    }
});

// ==================== 3. NOTICE ROUTES ====================

/**
 * GET /api/notices
 * Returns list of active notices and news
 */
app.get('/api/notices', async (req, res) => {
    try {
        const { category } = req.query;
        const filter = { isActive: true };
        if (category && category !== 'ALL') {
            filter.category = category.toUpperCase();
        }

        const notices = await Notice.find(filter).sort({ date: -1, createdAt: -1 });
        return res.status(200).json({
            success: true,
            count: notices.length,
            data: notices
        });
    } catch (err) {
        console.error('Error in GET /api/notices:', err);
        return res.status(500).json({ success: false, error: 'Failed to retrieve notices.' });
    }
});

/**
 * POST /api/notices (Protected - Admin only)
 * Creates a new notice or news announcement
 */
app.post('/api/notices', authenticateAdmin, async (req, res) => {
    try {
        const { title, category, date, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                error: 'Title and Content are required.'
            });
        }

        const newNotice = await Notice.create({
            title: title.trim(),
            category: (category || 'NOTICE').toUpperCase(),
            date: date || new Date().toISOString().split('T')[0],
            content: content.trim(),
            isActive: true
        });

        return res.status(201).json({
            success: true,
            message: 'Notice published successfully.',
            data: newNotice
        });
    } catch (err) {
        console.error('Error in POST /api/notices:', err);
        return res.status(500).json({ success: false, error: 'Failed to publish notice.' });
    }
});

/**
 * DELETE /api/notices/:id (Protected - Admin only)
 * Deletes a notice
 */
app.delete('/api/notices/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const deletedNotice = await Notice.findByIdAndDelete(id);

        if (!deletedNotice) {
            return res.status(404).json({ success: false, error: 'Notice not found.' });
        }

        return res.status(200).json({
            success: true,
            message: 'Notice deleted successfully.',
            id
        });
    } catch (err) {
        console.error('Error in DELETE /api/notices/:id:', err);
        return res.status(500).json({ success: false, error: 'Failed to delete notice.' });
    }
});

// ==================== 4. EVENT ROUTES ====================

/**
 * GET /api/events
 * Returns events filtered by type (Upcoming/Completed) or all
 */
app.get('/api/events', async (req, res) => {
    try {
        const { type } = req.query;
        const filter = {};
        if (type) {
            filter.type = new RegExp(`^${type.trim()}$`, 'i');
        }

        const events = await Event.find(filter).sort({ date: -1 });
        return res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (err) {
        console.error('Error in GET /api/events:', err);
        return res.status(500).json({ success: false, error: 'Failed to retrieve events.' });
    }
});

/**
 * POST /api/events (Protected - Admin only)
 * Creates a new event
 */
app.post('/api/events', authenticateAdmin, async (req, res) => {
    try {
        const { title, type, date, location, description } = req.body;

        if (!title || !date || !location || !description) {
            return res.status(400).json({
                success: false,
                error: 'Title, Date, Location, and Description are required.'
            });
        }

        const normalizedType = (type && type.toLowerCase() === 'completed') ? 'Completed' : 'Upcoming';

        const newEvent = await Event.create({
            title: title.trim(),
            type: normalizedType,
            date: date.trim(),
            location: location.trim(),
            description: description.trim()
        });

        return res.status(201).json({
            success: true,
            message: 'Event created successfully.',
            data: newEvent
        });
    } catch (err) {
        console.error('Error in POST /api/events:', err);
        return res.status(500).json({ success: false, error: 'Failed to create event.' });
    }
});

/**
 * DELETE /api/events/:id (Protected - Admin only)
 * Deletes an event
 */
app.delete('/api/events/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const deletedEvent = await Event.findByIdAndDelete(id);

        if (!deletedEvent) {
            return res.status(404).json({ success: false, error: 'Event not found.' });
        }

        return res.status(200).json({
            success: true,
            message: 'Event deleted successfully.',
            id
        });
    } catch (err) {
        console.error('Error in DELETE /api/events/:id:', err);
        return res.status(500).json({ success: false, error: 'Failed to delete event.' });
    }
});

// ==================== 5. EMAIL OTP CONTACT HANDLERS ====================
const otpStore = {};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim() : '',
        pass: process.env.EMAIL_APP_PASSWORD ? process.env.EMAIL_APP_PASSWORD.replace(/\s+/g, '') : ''
    }
});

// Periodic cleanup of expired OTPs
setInterval(() => {
    const now = Date.now();
    for (const email in otpStore) {
        if (otpStore[email].expiresAt < now) {
            delete otpStore[email];
        }
    }
}, 60000);

app.post('/send-otp', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ success: false, error: 'All fields (Name, Email, Subject, Message) are required.' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const safeName = name.replace(/[\r\n"]/g, '').trim();
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 5 * 60 * 1000;

        otpStore[normalizedEmail] = { otp, expiresAt };
        console.log(`[OTP GENERATED] Email: ${normalizedEmail} | OTP: ${otp}`);

        const mailOptions = {
            from: `"NDSC Verification" <${process.env.ADMIN_EMAIL}>`,
            to: normalizedEmail,
            subject: `Your Verification Code: ${otp}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 550px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; color: #1e293b;">
                    <h2 style="color: #0ea5e9; margin-top: 0;">Verification Code</h2>
                    <p>Hello <strong>${safeName}</strong>,</p>
                    <p>Use the following 6-digit code to complete sending your message on the NDSC website:</p>
                    <div style="background-color: #f0f9ff; border: 1px dashed #0ea5e9; border-radius: 6px; padding: 16px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0284c7;">${otp}</span>
                    </div>
                    <p style="font-size: 14px; color: #64748b;">This code will expire in <strong>5 minutes</strong>. Please do not share it with anyone.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ success: true, message: 'OTP sent to your email address successfully.' });
    } catch (err) {
        console.error('Error in /send-otp endpoint:', err);
        return res.status(500).json({
            success: false,
            error: err.message || 'Failed to send verification email. Please check server email credentials.'
        });
    }
});

app.post('/submit-message', async (req, res) => {
    try {
        const { name, email, subject, message, otp } = req.body;
        if (!name || !email || !subject || !message || !otp) {
            return res.status(400).json({ success: false, error: 'All fields including the OTP code are required.' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const safeName = name.replace(/[\r\n"]/g, '').trim();
        const record = otpStore[normalizedEmail];

        if (!record) {
            return res.status(400).json({ success: false, error: 'No OTP found or code has expired.' });
        }
        if (Date.now() > record.expiresAt) {
            delete otpStore[normalizedEmail];
            return res.status(400).json({ success: false, error: 'OTP code has expired. Please request a new code.' });
        }
        if (record.otp !== otp.trim()) {
            return res.status(400).json({ success: false, error: 'Incorrect OTP code. Please check your email and try again.' });
        }

        const adminMailOptions = {
            from: `"${safeName}" <${process.env.ADMIN_EMAIL}>`,
            to: process.env.ADMIN_EMAIL,
            replyTo: normalizedEmail,
            subject: `[NDSC Contact] ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 650px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; color: #1e293b;">
                    <h2 style="color: #0ea5e9; border-bottom: 2px solid #0ea5e9; padding-bottom: 8px; margin-top: 0;">New Contact Form Message</h2>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 15px;">
                        <tr><td style="padding: 10px; font-weight: bold; width: 100px; color: #475569;">Name:</td><td style="padding: 10px;">${safeName}</td></tr>
                        <tr><td style="padding: 10px; font-weight: bold; color: #475569;">Email:</td><td style="padding: 10px;"><a href="mailto:${normalizedEmail}">${normalizedEmail}</a></td></tr>
                        <tr><td style="padding: 10px; font-weight: bold; color: #475569;">Subject:</td><td style="padding: 10px;">${subject}</td></tr>
                        <tr><td style="padding: 10px; font-weight: bold; color: #475569; vertical-align: top;">Message:</td><td style="padding: 10px; background-color: #f8fafc; border-radius: 6px; white-space: pre-wrap;">${message}</td></tr>
                    </table>
                </div>
            `
        };

        await transporter.sendMail(adminMailOptions);
        delete otpStore[normalizedEmail];

        return res.status(200).json({ success: true, message: 'Your message has been verified and sent successfully!' });
    } catch (err) {
        console.error('Error in /submit-message endpoint:', err);
        return res.status(500).json({ success: false, error: 'Failed to deliver message.' });
    }
});

// ==================== 6. MPA PAGE ROUTES ====================
const mpaPages = ['members', 'notices', 'events', 'login', 'register', 'dashboard', 'profile', 'admin'];
mpaPages.forEach(page => {
    app.get(`/${page}`, (req, res) => {
        res.sendFile(path.join(__dirname, `${page}.html`));
    });
});

// Fallback route for client-side navigation
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 NDSC Full-Stack Server running on http://localhost:${PORT}`);
    console.log(`📡 REST API Endpoints active at /api/members, /api/notices, /api/events, /api/auth`);
    console.log(`====================================================`);
});

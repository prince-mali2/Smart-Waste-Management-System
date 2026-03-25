import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// WebSocket Server
const wss = new WebSocketServer({ server });
const clients = new Map<string, WebSocket>();

wss.on("connection", (ws, req) => {
  const url = new URL(req.url || "", `http://${req.headers.host}`);
  const token = url.searchParams.get("token");

  if (token) {
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (!err && user) {
        clients.set(user.id, ws);
        ws.on("close", () => clients.delete(user.id));
      }
    });
  }
});

function sendRealtimeNotification(userId: string, notification: any) {
  const client = clients.get(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(notification));
  }
}

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
  if (MONGODB_URI.includes("<username>") || MONGODB_URI.includes("<password>")) {
    console.error("CRITICAL: MONGODB_URI still contains placeholder values (<username> or <password>). Please update it in the Settings menu.");
  }

  mongoose.connect(MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => {
      if (err.message.includes("authentication failed")) {
        console.error("MongoDB Authentication Failed: Please check your username and password in the MONGODB_URI environment variable.");
      } else {
        console.error("MongoDB connection error:", err);
      }
    });
} else {
  console.warn("MONGODB_URI not found in environment variables. Database features will not work.");
}

// Schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["citizen", "admin", "worker"], default: "citizen" },
  points: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  description: { type: String, required: true },
  beforeImage: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: true },
  },
  status: { type: String, enum: ["pending", "assigned", "completed"], default: "pending" },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  wasteType: { type: String, enum: ["dry", "wet", "hazardous"], default: "dry" },
  assignedWorkerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  afterImage: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
const Report = mongoose.model("Report", reportSchema);

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["citizen", "admin", "worker"], required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model("Notification", notificationSchema);

async function createNotification(userId: string, role: string, message: string) {
  const notification = new Notification({ userId, role, message });
  await notification.save();
  sendRealtimeNotification(userId, { ...notification.toObject(), id: notification._id });
  return notification;
}

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

async function startServer() {
  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      
      if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email and password are required" });
      }

      if (mongoose.connection.readyState !== 1) {
        throw new Error("Database not connected. Please check MONGODB_URI in Settings.");
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = new User({
        name,
        email,
        password: hashedPassword,
        role: role || "citizen",
        points: role === "citizen" ? 0 : undefined
      });

      await user.save();
      
      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
      res.status(201).json({ 
        token, 
        user: { id: user._id, name: user.name, email: user.email, role: user.role, points: user.points } 
      });
    } catch (error: any) {
      console.error("Registration error details:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      console.log(`Login attempt for: ${email}`);
      
      if (mongoose.connection.readyState !== 1) {
        throw new Error("Database not connected. Please check MONGODB_URI in Settings.");
      }

      const user = await User.findOne({ email });
      
      if (!user) {
        console.log(`Login failed: User not found (${email})`);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log(`Login failed: Incorrect password for ${email}`);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
      console.log(`Login successful: ${email}`);
      
      res.json({ 
        token, 
        user: { id: user._id, name: user.name, email: user.email, role: user.role, points: user.points } 
      });
    } catch (error: any) {
      console.error("Login error details:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json({ id: user._id, name: user.name, email: user.email, role: user.role, points: user.points });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Reports Routes
  app.get("/api/reports", async (req, res) => {
    try {
      const reports = await Report.find().sort({ createdAt: -1 });
      res.json(reports.map(r => ({ ...r.toObject(), id: r._id })));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reports/heatmap", async (req, res) => {
    try {
      const reports = await Report.find({}, { "location.lat": 1, "location.lng": 1 });
      res.json(reports.map(r => ({
        location: {
          lat: r.location.lat,
          lng: r.location.lng
        }
      })));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Analytics Routes
  app.get("/api/analytics/complaints-by-area", async (req, res) => {
    try {
      const data = await Report.aggregate([
        {
          $group: {
            _id: "$location.address",
            complaints: { $sum: 1 }
          }
        },
        {
          $project: {
            name: "$_id",
            complaints: 1,
            _id: 0
          }
        },
        { $sort: { complaints: -1 } },
        { $limit: 10 }
      ]);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/analytics/weekly-trend", async (req, res) => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const data = await Report.aggregate([
        {
          $match: {
            createdAt: { $gte: sevenDaysAgo }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            name: "$_id",
            count: 1,
            _id: 0
          }
        }
      ]);

      // Fill in missing days with 0
      const result = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayData = data.find(item => item.name === dateStr);
        result.push({
          name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          count: dayData ? dayData.count : 0
        });
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/analytics/waste-distribution", async (req, res) => {
    try {
      const data = await Report.aggregate([
        {
          $group: {
            _id: "$wasteType",
            value: { $sum: 1 }
          }
        },
        {
          $project: {
            name: {
              $switch: {
                branches: [
                  { case: { $eq: ["$_id", "dry"] }, then: "Dry Waste" },
                  { case: { $eq: ["$_id", "wet"] }, then: "Wet Waste" },
                  { case: { $eq: ["$_id", "hazardous"] }, then: "Hazardous" }
                ],
                default: "Other"
              }
            },
            value: 1,
            _id: 0
          }
        }
      ]);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/analytics/summary", async (req, res) => {
    try {
      const totalReports = await Report.countDocuments();
      const completedReports = await Report.countDocuments({ status: "completed" });
      const recyclingReports = await Report.countDocuments({ wasteType: "dry" });

      const areaStats = await Report.aggregate([
        {
          $group: {
            _id: "$location.address",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ]);

      const efficiency = totalReports > 0 ? Math.round((completedReports / totalReports) * 100) : 0;
      const recyclingRate = totalReports > 0 ? Math.round((recyclingReports / totalReports) * 100) : 0;
      const totalWaste = (totalReports * 0.15).toFixed(1); // Mock calculation: 0.15 tons per report

      res.json({
        totalWasteCollected: `${totalWaste}t`,
        efficiencyPercentage: `${efficiency}%`,
        recyclingRate: `${recyclingRate}%`,
        highestComplaintArea: areaStats.length > 0 ? areaStats[0]._id : "N/A"
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/leaderboard", async (req, res) => {
    try {
      const citizens = await User.find({ role: "citizen" })
        .sort({ points: -1 })
        .limit(20)
        .select("name points _id");
      
      res.json(citizens.map((c, index) => ({
        id: c._id,
        name: c.name,
        points: c.points,
        rank: index + 1
      })));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Notification Routes
  app.get("/api/notifications", authenticateToken, async (req: any, res) => {
    try {
      const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50);
      res.json(notifications.map(n => ({ ...n.toObject(), id: n._id })));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/notifications/read-all", authenticateToken, async (req: any, res) => {
    try {
      await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
      res.json({ message: "All notifications marked as read" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/notifications/:id", authenticateToken, async (req: any, res) => {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        { isRead: true },
        { new: true }
      );
      if (!notification) return res.status(404).json({ error: "Notification not found" });
      res.json({ ...notification.toObject(), id: notification._id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/workers", authenticateToken, async (req: any, res) => {
    try {
      const workers = await User.find({ role: "worker" }).select("name email _id");
      res.json(workers.map(w => ({ id: w._id, name: w.name, email: w.email })));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/reports", authenticateToken, async (req: any, res) => {
    try {
      const report = new Report({
        ...req.body,
        userId: req.user.id
      });
      await report.save();

      // Award 20 points for reporting
      await User.findByIdAndUpdate(req.user.id, { $inc: { points: 20 } });

      // Notify Admins
      const admins = await User.find({ role: "admin" });
      for (const admin of admins) {
        await createNotification(admin._id.toString(), "admin", `New waste report submitted by ${req.user.name || 'a citizen'}`);
      }

      res.status(201).json({ ...report.toObject(), id: report._id });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/reports/:id", authenticateToken, async (req: any, res: any) => {
    try {
      const oldReport = await Report.findById(req.params.id);
      if (!oldReport) return res.status(404).json({ error: "Report not found" });

      const report = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!report) return res.status(404).json({ error: "Report not found" });

      // Notify Worker if assigned
      if (!oldReport.assignedWorkerId && report.assignedWorkerId) {
        await createNotification(report.assignedWorkerId.toString(), "worker", "You have been assigned a new waste collection task");
      }

      // Award points and notify if status changed to completed
      if (oldReport.status !== "completed" && report.status === "completed") {
        await User.findByIdAndUpdate(report.userId, { $inc: { points: 50 } });
        
        // Notify Citizen
        await createNotification(report.userId.toString(), "citizen", "Your complaint has been resolved. View the updated area.");
        
        // Notify Admins
        const admins = await User.find({ role: "admin" });
        for (const admin of admins) {
          await createNotification(admin._id.toString(), "admin", `A waste complaint has been marked as completed by a worker`);
        }
      }

      res.json({ ...report.toObject(), id: report._id });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

const busPass = require("../models/busPass.model");
const jwt = require("jsonwebtoken");
const { generateQR } = require("../utils/qr");
const crypto = require("crypto");

// Duration multipliers for pass types
const PASS_DURATION = {
  monthly: { days: 30, multiplier: 1 },
  quarterly: { days: 90, multiplier: 2.4 },
  "half-yearly": { days: 180, multiplier: 4 },
  yearly: { days: 365, multiplier: 7 },
};

// Base rate per km (for monthly pass)
const BASE_RATE_PER_KM = 3;
const MIN_FARE = 200;

// Bus stops with approximate coordinates (lat, lon) for distance calculation
const BUS_STOPS_DATA = {
  "Ahmedabad (Paldi)": { lat: 23.0225, lon: 72.5714 },
  "Ahmedabad (Maninagar)": { lat: 23.0054, lon: 72.6015 },
  "Ahmedabad (Kalupur)": { lat: 23.0301, lon: 72.6003 },
  "Gandhinagar": { lat: 23.2156, lon: 72.6369 },
  "Nadiad": { lat: 22.6916, lon: 72.8634 },
  "Anand": { lat: 22.5645, lon: 72.9289 },
  "Vadodara": { lat: 22.3072, lon: 73.1812 },
  "Bharuch": { lat: 21.7051, lon: 72.9959 },
  "Surat": { lat: 21.1702, lon: 72.8311 },
  "Navsari": { lat: 20.9467, lon: 72.9520 },
  "Valsad": { lat: 20.5992, lon: 72.9342 },
  "Vapi": { lat: 20.3893, lon: 72.9106 },
  "Rajkot": { lat: 22.3039, lon: 70.8022 },
  "Jamnagar": { lat: 22.4707, lon: 70.0577 },
  "Junagadh": { lat: 21.5222, lon: 70.4579 },
  "Bhavnagar": { lat: 21.7645, lon: 72.1519 },
  "Morbi": { lat: 22.8173, lon: 70.8377 },
  "Mehsana": { lat: 23.5880, lon: 72.3693 },
  "Palanpur": { lat: 24.1725, lon: 72.4384 },
  "Himmatnagar": { lat: 23.5969, lon: 72.9660 },
};

const BUS_STOPS = Object.keys(BUS_STOPS_DATA);

// Haversine formula to calculate distance between two coordinates in km
const calculateDistance = (source, destination) => {
  const srcData = BUS_STOPS_DATA[source];
  const destData = BUS_STOPS_DATA[destination];

  if (!srcData || !destData) return 0;

  const R = 6371; // Earth's radius in km
  const dLat = ((destData.lat - srcData.lat) * Math.PI) / 180;
  const dLon = ((destData.lon - srcData.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((srcData.lat * Math.PI) / 180) *
      Math.cos((destData.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLine = R * c;

  // Multiply by 1.3 to approximate road distance
  return Math.round(straightLine * 1.3);
};

// Calculate fare based on route and pass type
const calculateFare = (source, destination, passType) => {
  const duration = PASS_DURATION[passType];
  if (!duration) return 0;

  const distanceKm = calculateDistance(source, destination);
  const monthlyFare = Math.max(distanceKm * BASE_RATE_PER_KM, MIN_FARE);
  const totalFare = Math.round(monthlyFare * duration.multiplier);

  return totalFare;
};

// Get available bus stops
const getBusStops = (req, res) => {
  res.status(200).json({ success: true, data: BUS_STOPS });
};

// Calculate fare for a route (public endpoint for frontend price display)
const getFare = (req, res) => {
  const { source, destination } = req.query;

  if (!source || !destination) {
    return res.status(400).json({ message: "Source and destination are required" });
  }

  if (!BUS_STOPS_DATA[source] || !BUS_STOPS_DATA[destination]) {
    return res.status(400).json({ message: "Invalid bus stop" });
  }

  if (source === destination) {
    return res.status(400).json({ message: "Source and destination cannot be the same" });
  }

  const distanceKm = calculateDistance(source, destination);

  const fares = {};
  for (const [type, config] of Object.entries(PASS_DURATION)) {
    fares[type] = {
      price: calculateFare(source, destination, type),
      days: config.days,
    };
  }

  res.status(200).json({
    success: true,
    data: {
      source,
      destination,
      distanceKm,
      fares,
    },
  });
};

// User buys a pass — created as "pending", no QR yet
const buyPass = async (req, res) => {
  try {
    const { passType, source, destination } = req.body;
    const userId = req.user._id;

    const duration = PASS_DURATION[passType];
    if (!duration) {
      return res.status(400).json({ message: "Invalid pass type" });
    }

    if (!source || !destination) {
      return res.status(400).json({ message: "Source and destination are required" });
    }

    if (source === destination) {
      return res.status(400).json({ message: "Source and destination cannot be the same" });
    }

    if (!BUS_STOPS_DATA[source] || !BUS_STOPS_DATA[destination]) {
      return res.status(400).json({ message: "Invalid bus stop selected" });
    }

    const price = calculateFare(source, destination, passType);

    const newPass = await busPass.create({
      user: userId,
      passType,
      price,
      source,
      destination,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      data: {
        _id: newPass._id,
        passType: newPass.passType,
        price: newPass.price,
        source: newPass.source,
        destination: newPass.destination,
        status: newPass.status,
        createdAt: newPass.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error buying pass", error: error.message });
  }
};

// Admin approves a pending pass — generates QR, sets validity dates
const approvePass = async (req, res) => {
  try {
    const passId = req.params.id;

    // Validate if id is a valid MongoDB ObjectId
    if (!passId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid pass ID format" });
    }

    const pass = await busPass.findById(passId);
    if (!pass) {
      return res.status(404).json({ message: "Pass not found" });
    }
    if (pass.status !== "pending") {
      return res.status(400).json({ message: `Pass is already ${pass.status}` });
    }

    const duration = PASS_DURATION[pass.passType];
    const validFrom = new Date();
    const validTill = new Date();
    validTill.setDate(validFrom.getDate() + duration.days);

    const code16 = crypto.randomBytes(8).toString("hex").toUpperCase();
    const { token, qrImage } = await generateQR({
      _id: pass._id,
      user: pass.user,
      validTill,
    });

    pass.status = "active";
    pass.validFrom = validFrom;
    pass.validTill = validTill;
    pass.qrToken = token;
    pass.qrImage = qrImage;
    pass.code16 = code16;
    await pass.save();

    res.status(200).json({
      success: true,
      message: "Pass approved and activated",
      data: {
        _id: pass._id,
        passType: pass.passType,
        status: pass.status,
        validFrom: pass.validFrom,
        validTill: pass.validTill,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error approving pass", error: error.message });
  }
};

// Admin rejects a pending pass
const rejectPass = async (req, res) => {
  try {
    const passId = req.params.id;

    // Validate if id is a valid MongoDB ObjectId
    if (!passId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid pass ID format" });
    }

    const pass = await busPass.findById(passId);
    if (!pass) {
      return res.status(404).json({ message: "Pass not found" });
    }
    if (pass.status !== "pending") {
      return res.status(400).json({ message: `Pass is already ${pass.status}` });
    }

    pass.status = "rejected";
    await pass.save();

    res.status(200).json({
      success: true,
      message: "Pass rejected",
      data: { _id: pass._id, status: pass.status },
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error rejecting pass", error: error.message });
  }
};

// User fetches their own passes
const getUserPasses = async (req, res) => {
  try {
    const userId = req.user._id;
    const passes = await busPass.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: passes });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error fetching passes", error: error.message });
  }
};

// Admin fetches all passes (optional ?status=pending filter)
const getAllPasses = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const passes = await busPass
      .find(filter)
      .populate("user", "name email phone dateOfBirth")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: passes });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error fetching passes", error: error.message });
  }
};

// Verify a pass by QR token or 16-char code
const verifyPass = async (req, res) => {
  try {
    const { token, code } = req.body;

    let pass;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        pass = await busPass.findById(decoded.passId).populate("user", "name email phone dateOfBirth");
      } catch (jwtError) {
        console.error("JWT Verification Error:", jwtError.message);
        return res.status(400).json({ message: "Invalid or malformed token" });
      }
    } else if (code) {
      // Validate code format (should be 16 hex characters)
      if (!code || typeof code !== "string" || code.length !== 16) {
        return res.status(400).json({ message: "Invalid code format" });
      }
      pass = await busPass.findOne({ code16: code }).populate("user", "name email phone dateOfBirth");
    } else {
      return res.status(400).json({ message: "Provide token or code to verify" });
    }

    if (!pass) {
      return res.status(404).json({ message: "Invalid or expired pass" });
    }

    if (pass.status !== "active") {
      return res.status(400).json({ message: `Pass is not active (status: ${pass.status})` });
    }

    if (new Date() > pass.validTill) {
      pass.status = "expired";
      await pass.save();
      return res.status(400).json({ message: "Pass has expired" });
    }

    res.status(200).json({
      success: true,
      data: {
        passId: pass._id,
        userId: pass.user._id,
        userName: pass.user.name,
        userEmail: pass.user.email,
        userPhone: pass.user.phone,
        passType: pass.passType,
        source: pass.source,
        destination: pass.destination,
        price: pass.price,
        validFrom: pass.validFrom,
        validTill: pass.validTill,
        status: pass.status,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error verifying pass", error: error.message });
  }
};

module.exports = { buyPass, approvePass, rejectPass, getUserPasses, getAllPasses, verifyPass, getBusStops, getFare };

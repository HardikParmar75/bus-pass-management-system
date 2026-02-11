const busPass = require("../models/busPass.model");
const jwt = require("jsonwebtoken");
const { generateQR } = require("../utils/qr");
const crypto = require("crypto");

const PASS_CONFIG = {
  monthly: { days: 30, price: 500 },
  quarterly: { days: 90, price: 1200 },
  "half-yearly": { days: 180, price: 2000 },
  yearly: { days: 365, price: 3500 },
};

// User buys a pass — created as "pending", no QR yet
const buyPass = async (req, res) => {
  try {
    const { passType } = req.body;
    const userId = req.user._id;

    const config = PASS_CONFIG[passType];
    if (!config) {
      return res.status(400).json({ message: "Invalid pass type" });
    }

    const newPass = await busPass.create({
      user: userId,
      passType,
      price: config.price,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      data: {
        _id: newPass._id,
        passType: newPass.passType,
        price: newPass.price,
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

    const config = PASS_CONFIG[pass.passType];
    const validFrom = new Date();
    const validTill = new Date();
    validTill.setDate(validFrom.getDate() + config.days);

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
      .populate("user", "name email phone age")
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
        pass = await busPass.findById(decoded.passId).populate("user", "name email phone age");
      } catch (jwtError) {
        console.error("JWT Verification Error:", jwtError.message);
        return res.status(400).json({ message: "Invalid or malformed token" });
      }
    } else if (code) {
      // Validate code format (should be 16 hex characters)
      if (!code || typeof code !== "string" || code.length !== 16) {
        return res.status(400).json({ message: "Invalid code format" });
      }
      pass = await busPass.findOne({ code16: code }).populate("user", "name email phone age");
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

module.exports = { buyPass, approvePass, rejectPass, getUserPasses, getAllPasses, verifyPass };

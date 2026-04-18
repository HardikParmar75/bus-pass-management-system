const mongoose = require("mongoose");

const busPassSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    passType: {
      type: String,
      enum: ["monthly", "quarterly", "half-yearly", "yearly"],
      required: true,
    },
    price: {
      type: Number,
    },
    validFrom: {
      type: Date,
    },
    validTill: {
      type: Date,
    },
    qrToken: {
      type: String,
    },
    qrImage: {
      type: String,
    },
    code16: {
      type: String,
      unique: true,
      sparse: true,
    },
    source: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    memberName: {
      type: String,
      default: null,
    },
    memberEmail: {
      type: String,
      default: null,
    },
    memberUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    memberDOB: {
      type: Date,
      default: null,
    },
    memberRelation: {
      type: String,
      enum: ["Self", "Spouse", "Father", "Mother", "Son", "Daughter", "Brother", "Sister", "Other", null],
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "active", "rejected", "expired"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

const busPass = mongoose.model("busPass", busPassSchema);

module.exports = busPass;

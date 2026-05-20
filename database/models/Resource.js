const express = require('express');
const router = express.Router();

const Resource = require('../models/Resource');
const User = require('../models/users');
const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    link: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, default: "" },
    createdBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        identifier: String,
        role: String
    }
}, { timestamps: true });

module.exports = mongoose.model("Resource", resourceSchema);
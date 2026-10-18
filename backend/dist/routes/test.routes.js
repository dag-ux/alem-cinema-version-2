"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Test route is working!",
        timestamp: new Date().toISOString()
    });
});
router.get("/ping", (req, res) => {
    res.json({
        success: true,
        message: "Test pong!",
        timestamp: new Date().toISOString()
    });
});
exports.default = router;

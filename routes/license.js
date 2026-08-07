console.log("📄 license.js loaded");

const express = require("express");
const router = express.Router();

const licenseService = require("../services/license");
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

router.post("/verify", (req, res) => {

    console.log("📥 POST /license/verify");
    console.log(req.body);

    const { license } = req.body;

    const response = licenseService.verifyLicense(license);

    res.json(response);
});

router.post("/activate", (req, res) => {

    const { license, serverUUID } = req.body;

    const success =
        licenseService.activateLicense(
            license,
            serverUUID
        );

   res.json({
    valid: success,
    status: success ? "ACTIVE" : "INVALID_SERVER"
});

});

router.post("/heartbeat", (req, res) => {

    const { license } = req.body;

    licenseService.heartbeat(license);

    res.json({
        success: true
    });

});

router.post("/reset", (req, res) => {

    const auth = req.headers.authorization;

    if (auth !== `Bearer ${ADMIN_TOKEN}`) {

        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });

    }

    const { license } = req.body;

    const success = licenseService.resetLicense(license);

    res.json({
        success
    });

});


module.exports = router;
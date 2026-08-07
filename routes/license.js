console.log("📄 license.js loaded");

const express = require("express");
const router = express.Router();

const licenseService = require("../services/license");

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
        success
    });

});

router.post("/heartbeat", (req, res) => {

    const { license } = req.body;

    licenseService.heartbeat(license);

    res.json({
        success: true
    });

});



module.exports = router;
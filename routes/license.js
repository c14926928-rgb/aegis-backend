console.log("📄 license.js loaded");

const express = require("express");
const router = express.Router();

const licenseService = require("../services/license");

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

/*
 * VERIFY
 * - Verifica la licencia.
 * - Si nunca fue activada, registra el UUID.
 * - Si ya pertenece al mismo UUID, permite.
 * - Si pertenece a otro UUID, rechaza.
 */
router.post("/verify", (req, res) => {

    console.log("📥 POST /license/verify");
    console.log(req.body);

    const {
        license,
        serverUUID,
        serverName,
        version
    } = req.body;

    const response = licenseService.verifyLicense(
        license,
        serverUUID,
        serverName,
        version
    );

    res.json(response);

});

/*
 * HEARTBEAT
 */
router.post("/heartbeat", (req, res) => {

    const { license } = req.body;

    licenseService.heartbeat(license);

    res.json({
        success: true
    });

});

/*
 * RESET
 */
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
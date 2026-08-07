const express = require("express");
const router = express.Router();

const crypto = require("crypto");

const licenses = require("../database/licenses");

router.post("/license/create", (req, res) => {

    const {

        owner,

        email,

        discordId,

        plan,

        expires

    } = req.body;

    const license =

        "CP-AEGIS-" +

        crypto.randomBytes(8)
            .toString("hex")
            .toUpperCase();

    licenses.create({

        license,

        owner,

        email,

        discordId,

        discordGuild: "",

        plan,

        status: "ACTIVE",

        serverUUID: "",

        firstActivation: null,

        lastHeartbeat: null,

        expires,

        version: "1.0.0"

    });

    res.json({

        success: true,

        license

    });

});

module.exports = router;
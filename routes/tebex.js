const express = require("express");
const router = express.Router();

const tebex = require("../services/tebex");

router.post("/webhook", async (req, res) => {

    try {

        await tebex.handleWebhook(req.body);

        res.sendStatus(200);

    } catch (err) {

        console.error(err);

        res.sendStatus(500);

    }

});

module.exports = router;
const crypto = require("crypto");

const licenses = require("../database/licenses");

async function handleWebhook(data) {

    /*
        Aquí más adelante validaremos
        la firma (signature) de Tebex.
    */

    const license =

        "CP-AEGIS-" +

        crypto.randomBytes(8)
            .toString("hex")
            .toUpperCase();

    licenses.create({

        license,

        owner: data.username ?? "Unknown",

        email: data.email ?? "",

        discordId: "",

        discordGuild: "",

        plan: data.plan ?? "PREMIUM",

        status: "ACTIVE",

        serverUUID: "",

        firstActivation: null,

        lastHeartbeat: null,

        expires: data.expires ?? null,

        version: "1.0.0"

    });

    console.log(

        "[Tebex] License created:",

        license

    );

}

module.exports = {

    handleWebhook

};
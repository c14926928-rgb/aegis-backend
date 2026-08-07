const licenses = require("../database/licenses");

function verifyLicense(key) {

    const license = licenses.getByKey(key);

    if (!license) {

        return {
            valid: false,
            status: "NOT_FOUND",
            message: "License not found."
        };

    }

    if (license.status !== "ACTIVE") {

        return {
            valid: false,
            status: license.status,
            message: "License is not active."
        };

    }

    if (new Date(license.expires) < new Date()) {

        return {
            valid: false,
            status: "EXPIRED",
            message: "License expired."
        };

    }

    return {

        valid: true,

        status: "ACTIVE",

        plan: license.plan,

        expires: license.expires,

        owner: license.owner,

        version: license.version

    };

}

function activateLicense(key, serverUUID) {

    const license = licenses.getByKey(key);

    if (!license) {
        return false;
    }

    if (!license.serverUUID || license.serverUUID === "") {

        licenses.update(key, {

            serverUUID,

            firstActivation: new Date().toISOString()

        });

        return true;

    }

    return license.serverUUID === serverUUID;
    
function activateLicense(key, serverUUID) {

    const license = licenses.getByKey(key);

    if (!license) {
        return false;
    }

    if (license.status !== "ACTIVE") {
        return false;
    }

    // Primera activación
    if (!license.serverUUID || license.serverUUID === "") {

        licenses.update(key, {
            serverUUID: serverUUID,
            firstActivation: new Date().toISOString()
        });

        console.log("[LICENSE] First activation");
        console.log("License :", key);
        console.log("Server  :", serverUUID);

        return true;
    }

    // Ya pertenece a este servidor
    if (license.serverUUID === serverUUID) {

        console.log("[LICENSE] Returning server");

        return true;
    }

    // Intento de usar la licencia en otro servidor
    console.warn("======================================");
    console.warn("UNAUTHORIZED LICENSE ACTIVATION");
    console.warn("License :", key);
    console.warn("Expected:", license.serverUUID);
    console.warn("Received:", serverUUID);
    console.warn("======================================");

    return false;
}
}

function heartbeat(key) {

    licenses.update(key, {

        lastHeartbeat: new Date().toISOString()

    });

}

function revokeLicense(key) {

    licenses.update(key, {

        status: "REVOKED"

    });

}

function expireLicense(key) {

    licenses.update(key, {

        status: "EXPIRED"

    });

}

function resetLicense(key) {

    const license = licenses.getByKey(key);

    if (!license) {
        return false;
    }

    licenses.update(key, {

        serverUUID: null,
        firstActivation: null,
        lastHeartbeat: null

    });

    console.log("======================================");
    console.log("[LICENSE RESET]");
    console.log("License :", key);
    console.log("======================================");

    return true;

}

module.exports = {
    verifyLicense,
    activateLicense,
    heartbeat,
    revokeLicense,
    resetLicense
};


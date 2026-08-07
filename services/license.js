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

module.exports = {

    verifyLicense,

    activateLicense,

    heartbeat,

    revokeLicense,

    expireLicense

};
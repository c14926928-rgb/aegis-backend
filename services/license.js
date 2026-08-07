function verifyLicense(key, serverUUID, serverName, version) {

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

    // Primera activación
    if (!license.serverUUID || license.serverUUID === "") {

        licenses.update(key, {
            serverUUID: serverUUID,
            serverName: serverName,
            version: version,
            firstActivation: new Date().toISOString()
        });

        console.log("======================================");
        console.log("[LICENSE] FIRST ACTIVATION");
        console.log("License :", key);
        console.log("Server  :", serverUUID);
        console.log("======================================");

    }
    // La licencia pertenece a otro servidor
    else if (license.serverUUID !== serverUUID) {

        console.warn("======================================");
        console.warn("[LICENSE] INVALID SERVER");
        console.warn("License :", key);
        console.warn("Expected:", license.serverUUID);
        console.warn("Received:", serverUUID);
        console.warn("======================================");

        return {
            valid: false,
            status: "INVALID_SERVER",
            message: "License belongs to another server."
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

function verifyLicense(key, serverUUID, serverName, version) {

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

    if (!license.serverUUID || license.serverUUID === "") {

        licenses.update(key, {
            serverUUID: serverUUID,
            serverName: serverName,
            version: version,
            firstActivation: new Date().toISOString()
        });

        console.log("[LICENSE] FIRST ACTIVATION");
        console.log("License:", key);
        console.log("Server:", serverUUID);

    } else if (license.serverUUID !== serverUUID) {

        return {
            valid: false,
            status: "INVALID_SERVER",
            message: "License belongs to another server."
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


module.exports = {
    verifyLicense
};
const licenses = require("../database/licenses");

function heartbeat(licenseKey) {

    const license = licenses.getByKey(licenseKey);

    if (!license) {

        return {
            valid: false,
            status: "NOT_FOUND"
        };

    }

    licenses.update(licenseKey, {

        lastHeartbeat: new Date().toISOString()

    });

    return {

        valid: true,

        status: license.status,

        expires: license.expires

    };

}

module.exports = {

    heartbeat

};
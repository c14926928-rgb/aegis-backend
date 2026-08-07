const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "licenses.json");

function load() {
    if (!fs.existsSync(FILE)) {
        fs.writeFileSync(FILE, "[]");
    }

    return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

function save(data) {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 4));
}

function getAll() {
    return load();
}

function getByKey(key) {
    return load().find(l => l.license === key);
}

function create(license) {
    const licenses = load();

    licenses.push(license);

    save(licenses);

    return license;
}

function update(key, updates) {
    const licenses = load();

    const index = licenses.findIndex(l => l.license === key);

    if (index === -1) {
        return null;
    }

    licenses[index] = {
        ...licenses[index],
        ...updates
    };

    save(licenses);

    return licenses[index];
}

function remove(key) {
    const licenses = load();

    const filtered = licenses.filter(l => l.license !== key);

    save(filtered);
}

module.exports = {

    getAll,

    getByKey,

    create,

    update,

    remove

};
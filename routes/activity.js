'use strict';
var util = require('util');

// Deps
const Path = require('path');
const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));

exports.logExecuteData = [];

// Functie voor het loggen van requestdata
function logData(req) {
    exports.logExecuteData.push({
        body: req.body,
        headers: req.headers,
        trailers: req.trailers,
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        route: req.route,
        cookies: req.cookies,
        ip: req.ip,
        path: req.path,
        host: req.host,
        fresh: req.fresh,
        stale: req.stale,
        protocol: req.protocol,
        secure: req.secure,
        originalUrl: req.originalUrl
    });
    console.log("Received Request:", util.inspect(req.body, { depth: null }));
}

// Functie voor het controleren van het tijdformaat (HH:mm)
function isValidTimeFormat(time) {
    return /^\d{2}:\d{2}$/.test(time);  // Controleer of het voldoet aan "HH:mm"
}

/*
 * POST Handler for /edit/ route of Activity.
 */
exports.edit = function (req, res) {
    logData(req);
    res.status(200).send('Edit');
};

/*
 * POST Handler for /save/ route of Activity.
 */
exports.save = function (req, res) {
    logData(req);
    res.status(200).send('Save');
};

/*
 * POST Handler for /execute/ route of Activity.
 * Hier controleren we of de huidige tijd binnen de ingestelde tijden ligt.
 */
exports.execute = function (req, res) {
    JWT(req.body, process.env.jwtSecret, (err, decoded) => {
        if (err) {
            console.error("JWT Decode Error:", err);
            return res.status(401).end();
        }

        if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
            // 🛠️ Extra logging voor debuggen
            console.log("✅ Ontvangen inArguments:", JSON.stringify(decoded.inArguments, null, 2));

            var inArguments = Object.assign({}, ...decoded.inArguments); // Fix voor arrays

            let startTime = inArguments.startTime; // "HH:mm"
            let endTime = inArguments.endTime; // "HH:mm"

            // Log extra debug-info
            console.log(`🔹 StartTime ontvangen: ${startTime} (type: ${typeof startTime})`);
            console.log(`🔹 EndTime ontvangen: ${endTime} (type: ${typeof endTime})`);

            if (!startTime || !endTime || !isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
                console.error("❌ Start- en eindtijd niet opgegeven of ongeldig formaat.");
                return res.status(400).json({ error: "Start- en eindtijd moeten aanwezig zijn en in het juiste formaat (HH:mm)." });
            }

            // Huidige tijd ophalen
            let currentTime = new Date();
            let currentHours = currentTime.getHours();
            let currentMinutes = currentTime.getMinutes();

            // Start- en eindtijd omzetten naar minuten voor vergelijking
            let [startHours, startMinutes] = startTime.split(":").map(Number);
            let [endHours, endMinutes] = endTime.split(":").map(Number);

            let currentTotalMinutes = currentHours * 60 + currentMinutes;
            let startTotalMinutes = startHours * 60 + startMinutes;
            let endTotalMinutes = endHours * 60 + endMinutes;

            console.log(`🕒 Vergelijking - Start: ${startHours}:${startMinutes}, End: ${endHours}:${endMinutes}, Current: ${currentHours}:${currentMinutes}`);

            // Vergelijk de tijden en bepaal of het record verwerkt of vastgehouden moet worden
            if (currentTotalMinutes >= startTotalMinutes && currentTotalMinutes <= endTotalMinutes) {
                console.log("✅ Tijd is binnen het ingestelde bereik. Record wordt verwerkt.");
                res.status(200).json({ status: "success", message: "Record verwerkt binnen ingestelde tijd." });
            } else {
                console.log("❌ Tijd is NIET binnen het ingestelde bereik. Record wordt vastgehouden.");
                res.status(200).json({ status: "held", message: "Record wordt vastgehouden tot het ingestelde tijdsvenster." });
            }
        } else {
            console.error("❌ inArguments ontbreekt of is ongeldig.");
            return res.status(400).json({ error: "inArguments ontbreekt of is ongeldig." });
        }
    });
};

/*
 * POST Handler for /publish/ route of Activity.
 */
exports.publish = function (req, res) {
    logData(req);
    res.status(200).send('Publish');
};

/*
 * POST Handler for /validate/ route of Activity.
 */
exports.validate = function (req, res) {
    logData(req);
    res.status(200).send('Validate');
};

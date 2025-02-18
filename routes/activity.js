'use strict';
var util = require('util');

// Deps
const Path = require('path');
const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));

exports.logExecuteData = [];

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

/*
 * POST Handler for /edit/ route of Activity.
 */
exports.edit = function (req, res) {
    logData(req);
    res.send(200, 'Edit');
};

/*
 * POST Handler for /save/ route of Activity.
 */
exports.save = function (req, res) {
    logData(req);
    res.send(200, 'Save');
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
            var inArguments = decoded.inArguments[0];

            logData(req);

            let startTime = inArguments.startTime; // "HH:mm"
            let endTime = inArguments.endTime; // "HH:mm"

            if (!startTime || !endTime) {
                console.error("Start- en eindtijd niet opgegeven.");
                return res.status(400).json({ error: "Start- en eindtijd niet opgegeven." });
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

            console.log(`Start: ${startHours}:${startMinutes}, End: ${endHours}:${endMinutes}, Current: ${currentHours}:${currentMinutes}`);

            if (currentTotalMinutes >= startTotalMinutes && currentTotalMinutes <= endTotalMinutes) {
                console.log("✅ Tijd is binnen het ingestelde bereik. Record wordt verwerkt.");
                res.status(200).json({ status: "success", message: "Record verwerkt binnen ingestelde tijd." });
            } else {
                console.log("❌ Tijd is NIET binnen het ingestelde bereik. Record wordt vastgehouden.");
                res.status(200).json({ status: "held", message: "Record wordt vastgehouden tot het ingestelde tijdsvenster." });
            }
        } else {
            console.error("inArguments ontbreekt of is ongeldig.");
            return res.status(400).json({ error: "inArguments ontbreekt of is ongeldig." });
        }
    });
};

/*
 * POST Handler for /publish/ route of Activity.
 */
exports.publish = function (req, res) {
    logData(req);
    res.send(200, 'Publish');
};

/*
 * POST Handler for /validate/ route of Activity.
 */
exports.validate = function (req, res) {
    logData(req);
    res.send(200, 'Validate');
};

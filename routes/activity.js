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
    console.log("📩 Received Request:", util.inspect(req.body, { depth: null }));
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
 */
exports.execute = function (req, res) {
    console.log("🚀 /execute route aangeroepen");

    JWT(req.body, process.env.jwtSecret, (err, decoded) => {
        if (err) {
            console.error("❌ JWT Decode Error:", err);
            return res.status(401).end();
        }

        console.log("🔑 JWT succesvol gedecodeerd:", JSON.stringify(decoded, null, 2));

        if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
            console.log("✅ Ontvangen inArguments:", JSON.stringify(decoded.inArguments, null, 2));

            var inArguments = Object.assign({}, ...decoded.inArguments); // Fix voor arrays

            let startTime = inArguments.startTime; // "HH:mm"
            let endTime = inArguments.endTime; // "HH:mm"

            console.log("🔹 StartTime ontvangen:", startTime);
            console.log("🔹 EndTime ontvangen:", endTime);

            // Controleer of de tijden bestaan en of ze het juiste formaat hebben
            if (!startTime || !endTime || !isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
                console.error("❌ Start- en eindtijd niet opgegeven of ongeldig formaat.");
                return res.status(400).json({ error: "Start- en eindtijd moeten aanwezig zijn en in het juiste formaat (HH:mm)." });
            }

            // Huidige tijd ophalen in UTC
            let currentTime = new Date();
            let currentHours = currentTime.getUTCHours();  // Gebruik UTC
            let currentMinutes = currentTime.getUTCMinutes();  // Gebruik UTC

            // Start- en eindtijd omzetten naar minuten voor vergelijking
            let [startHours, startMinutes] = startTime.split(":").map(Number);
            let [endHours, endMinutes] = endTime.split(":").map(Number);

            let currentTotalMinutes = currentHours * 60 + currentMinutes;
            let startTotalMinutes = startHours * 60 + startMinutes;
            let endTotalMinutes = endHours * 60 + endMinutes;

            console.log("🕒 Tijd Vergelijking:");
            console.log("   🔹 Starttijd:", startHours + ":" + startMinutes);
            console.log("   🔹 Eindtijd:", endHours + ":" + endMinutes);
            console.log("   🔹 Huidige UTC-tijd:", currentHours + ":" + currentMinutes);
            console.log("   🔹 Start in minuten:", startTotalMinutes);
            console.log("   🔹 End in minuten:", endTotalMinutes);
            console.log("   🔹 Current UTC in minuten:", currentTotalMinutes);

            // Check of eindtijd eerder is dan starttijd (bijvoorbeeld 23:00 - 02:00)
            if (endTotalMinutes < startTotalMinutes) {
                // Voeg 24 uur toe aan de eindtijd om de logica over middernacht te laten werken
                endTotalMinutes += 24 * 60;
            }

            // Vergelijk de tijden en bepaal of het record verwerkt of vastgehouden moet worden
            if (currentTotalMinutes >= startTotalMinutes && currentTotalMinutes <= endTotalMinutes) {
                console.log("✅ Tijd is binnen het ingestelde bereik. Record wordt verwerkt.");
                res.status(200).json({ 
                    recordStatus: "processed",  // Record wordt verwerkt
                    message: "Record verwerkt binnen ingestelde tijd."
                });
            } else {
                console.log("❌ Tijd is NIET binnen het ingestelde bereik. Record wordt vastgehouden.");
                res.status(200).json({ 
                    recordStatus: "held",  // Record wordt vastgehouden
                    message: "Record wordt vastgehouden tot het ingestelde tijdsvenster."
                });
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

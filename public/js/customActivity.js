define([
    'postmonger'
], function (Postmonger) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};

    $(window).ready(onRender);

    connection.on('initActivity', initialize);
    connection.on('clickedNext', save);

    function onRender() {
        connection.trigger('ready');
    }

    function initialize(data) {
        console.log("🔹 Initializing activity with data:", JSON.stringify(data, null, 2));

        if (data) {
            payload = data;
        }

        var inArguments = payload?.arguments?.execute?.inArguments || [];

        var startTime = "00:00";
        var endTime = "23:59";

        inArguments.forEach(arg => {
            if (arg.startTime) startTime = arg.startTime;
            if (arg.endTime) endTime = arg.endTime;
        });

        $('#start-time').val(startTime);
        $('#end-time').val(endTime);

        connection.trigger('updateButton', {
            button: 'next',
            text: 'done',
            visible: true
        });
    }

    function save() {
        var startTime = $('#start-time').val();
        var endTime = $('#end-time').val();

        console.log("🕒 Start Time:", startTime);
        console.log("🕒 End Time:", endTime);

        // Huidige UTC-tijd ophalen
        var now = new Date();
        var currentUTCMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();

        // Start- en eindtijd omzetten naar UTC-minuten
        var [startHours, startMinutes] = startTime.split(":").map(Number);
        var [endHours, endMinutes] = endTime.split(":").map(Number);

        var startTotalMinutes = startHours * 60 + startMinutes;
        var endTotalMinutes = endHours * 60 + endMinutes;

        // Als de eindtijd vóór de starttijd ligt (bijv. 23:00 - 02:00), behandel het als een overgang naar de volgende dag
        if (endTotalMinutes < startTotalMinutes) {
            endTotalMinutes += 24 * 60;  // Voeg een dag toe
        }

        var recordStatus = "processed"; // Standaard: direct doorlaten
        if (currentUTCMinutes >= startTotalMinutes && currentUTCMinutes <= endTotalMinutes) {
            recordStatus = "held"; // Houd het record vast
        }

        console.log(`🚦 Record Status: ${recordStatus}`);

        payload.arguments.execute.inArguments = [
            { "startTime": startTime },
            { "endTime": endTime }
        ];

        payload.arguments.execute.outArguments = [
            { "recordStatus": recordStatus }
        ];

        payload.metaData.isConfigured = true;

        console.log("🔹 Updated Payload:", JSON.stringify(payload, null, 2));

        connection.trigger('updateActivity', payload);
    }
});

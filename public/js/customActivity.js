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
        var currentTime = new Date(`1970-01-01T${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}:00Z`);

        // Start- en eindtijd naar Date-objecten converteren
        var startTimeUTC = new Date(`1970-01-01T${startTime}:00Z`);
        var endTimeUTC = new Date(`1970-01-01T${endTime}:00Z`);

        // Controleer of eindtijd vóór starttijd ligt (overgang naar volgende dag)
        if (endTimeUTC < startTimeUTC) {
            endTimeUTC.setDate(endTimeUTC.getDate() + 1);  // Eindtijd naar de volgende dag verschuiven
        }

        console.log(`🕒 Huidige tijd: ${currentTime.toISOString()}, Starttijd: ${startTimeUTC.toISOString()}, Eindtijd: ${endTimeUTC.toISOString()}`);

        // Recordstatus bepalen
        var recordStatus = (currentTime >= startTimeUTC && currentTime <= endTimeUTC) ? "held" : "processed";

        console.log(`🚦 Record Status: ${recordStatus}`);

        // Payload bijwerken
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

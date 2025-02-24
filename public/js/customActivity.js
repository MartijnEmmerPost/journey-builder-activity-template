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

        // Huidige tijd ophalen in lokale tijd (Nederlandse tijd - GMT+1)
        var now = new Date();
        var localOffset = 1 * 60 * 60000; // Nederland is GMT +1 (1 uur in milliseconden)
        var currentTime = new Date(now.getTime() + localOffset); // Pas de tijd aan naar lokale tijd (Nederlandse tijd)

        // Start- en eindtijd omzetten naar lokale tijd (in Nederland)
        var [startHours, startMinutes] = startTime.split(":").map(Number);
        var [endHours, endMinutes] = endTime.split(":").map(Number);

        // Zet start- en eindtijd naar lokale tijd
        var startTimeLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHours, startMinutes);
        var endTimeLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHours, endMinutes);

        // Log de tijden om te controleren
        console.log(`🕒 Huidige tijd (lokale tijd): ${currentTime.toISOString()}, Starttijd (lokale tijd): ${startTimeLocal.toISOString()}, Eindtijd (lokale tijd): ${endTimeLocal.toISOString()}`);
        console.log(`Tijdverschil (Huidige tijd - Starttijd): ${currentTime - startTimeLocal}ms`);
        console.log(`Tijdverschil (Eindtijd - Huidige tijd): ${endTimeLocal - currentTime}ms`);

        // Als de eindtijd vóór de starttijd ligt (bijv. 23:00 - 02:00), behandel het als een overgang naar de volgende dag
        if (endTimeLocal < startTimeLocal) {
            endTimeLocal.setDate(endTimeLocal.getDate() + 1);  // Voeg een dag toe voor de overgang naar de volgende dag
        }

        // Bepaal de status van het record
        var recordStatus = "processed"; // Standaard: direct doorlaten
        if (currentTime >= startTimeLocal && currentTime <= endTimeLocal) {
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

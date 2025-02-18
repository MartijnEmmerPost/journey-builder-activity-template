define([
    'postmonger'
], function (
    Postmonger
) {
    'use strict';

    var connection = new Postmonger.Session();
    var authTokens = {};
    var payload = {};
    $(window).ready(onRender);

    // Events voor de activiteit
    connection.on('initActivity', initialize);
    connection.on('requestedTokens', onGetTokens);
    connection.on('requestedEndpoints', onGetEndpoints);
    connection.on('requestedInteraction', onRequestedInteraction);
    connection.on('requestedTriggerEventDefinition', onRequestedTriggerEventDefinition);
    connection.on('requestedDataSources', onRequestedDataSources);
    connection.on('clickedNext', save);

    // Bij renderen van de activiteit
    function onRender() {
        connection.trigger('ready');
        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');
        connection.trigger('requestInteraction');
        connection.trigger('requestTriggerEventDefinition');
        connection.trigger('requestDataSources');
    }

    function onRequestedDataSources(dataSources) {
        console.log('*** requestedDataSources ***');
        console.log(dataSources);
    }

    function onRequestedInteraction(interaction) {    
        console.log('*** requestedInteraction ***');
        console.log(interaction);
    }

    function onRequestedTriggerEventDefinition(eventDefinitionModel) {
        console.log('*** requestedTriggerEventDefinition ***');
        console.log(eventDefinitionModel);
    }

    // Initialisatie van de activiteit
    function initialize(data) {
        console.log("Initializing data: " + JSON.stringify(data));
        if (data) {
            payload = data;
        }

        // Haal inArguments op en vul de tijden in de invoervelden
        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : {};

        console.log('Has In arguments: ' + JSON.stringify(inArguments));

        // Vul de tijden in als ze zijn ingesteld
        $.each(inArguments, function (index, inArgument) {
            $.each(inArgument, function (key, val) {
                if (key === 'startTime') {
                    $('#start-time').val(val);
                }
                if (key === 'endTime') {
                    $('#end-time').val(val);
                }
            });
        });

        // Update de knop van 'Next' naar 'Done'
        connection.trigger('updateButton', {
            button: 'next',
            text: 'done',
            visible: true
        });
    }

    // Verkrijg de tokens (authenticatie)
    function onGetTokens(tokens) {
        console.log("Tokens received: " + JSON.stringify(tokens));
        authTokens = tokens;
    }

    // Verkrijg de endpoints
    function onGetEndpoints(endpoints) {
        console.log("Endpoints received: " + JSON.stringify(endpoints));
    }

// Save functie
function save() {
    // Haal de tijden op uit de invoervelden (als string)
    var startTime = $('#start-time').val(); // Tijd als string (bijv. "HH:mm")
    var endTime = $('#end-time').val();     // Tijd als string (bijv. "HH:mm")

    console.log('Start time: ' + startTime);  // Debug log om te controleren of de tijden correct worden gelezen
    console.log('End time: ' + endTime);

    // Huidige tijd (in UTC)
    var currentTime = new Date();
    var currentUTC = new Date(currentTime.toUTCString());  // Zet de huidige tijd naar UTC
    var currentHours = currentUTC.getUTCHours();
    var currentMinutes = currentUTC.getUTCMinutes();
    var currentTotalMinutes = currentHours * 60 + currentMinutes;

    // Start- en eindtijd omzetten naar minuten voor vergelijking
    var [startHours, startMinutes] = startTime.split(":").map(Number);
    var [endHours, endMinutes] = endTime.split(":").map(Number);

    // Zet de tijden om naar UTC voor de vergelijking
    var startTotalMinutes = startHours * 60 + startMinutes;
    var endTotalMinutes = endHours * 60 + endMinutes;

    // Vergelijking van de tijden (controleer of huidige tijd tussen start en eind ligt)
    if (currentTotalMinutes >= startTotalMinutes && currentTotalMinutes <= endTotalMinutes) {
        // Als de huidige tijd binnen het ingestelde bereik ligt, wordt het record vastgehouden
        console.log("❌ Tijd is binnen het ingestelde bereik. Record wordt vastgehouden.");
        // Stel outArguments in om record vast te houden
        payload['arguments'].execute.outArguments = [{
            "recordStatus": "held"  // Markeer het record als 'held' (vastgehouden)
        }];
    } else {
        // Als de huidige tijd buiten het ingestelde bereik valt, wordt het record verder verwerkt
        console.log("✅ Tijd is buiten het ingestelde bereik. Record wordt verwerkt.");
        // Stel outArguments in om record door te laten gaan
        payload['arguments'].execute.outArguments = [{
            "recordStatus": "processed"  // Markeer het record als 'processed' (door laten gaan)
        }];
    }

    // Sla de tijden op in de inArguments van de payload
    payload['arguments'].execute.inArguments = [{
        "startTime": startTime,  // Bewaar de tijd als string (bijv. "HH:mm")
        "endTime": endTime       // Bewaar de tijd als string (bijv. "HH:mm")
    }];

    // Markeer de activiteit als geconfigureerd
    payload['metaData'].isConfigured = true;

    console.log("Payload on SAVE function: " + JSON.stringify(payload));

    // Update de activiteit
    connection.trigger('updateActivity', payload);
}


});

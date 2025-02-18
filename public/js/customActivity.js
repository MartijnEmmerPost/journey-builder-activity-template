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
    console.log("StartTime type:", typeof startTime);
    console.log("EndTime type:", typeof endTime);

    // Huidige tijd
    var currentTime = new Date();
    var currentHours = currentTime.getHours();
    var currentMinutes = currentTime.getMinutes();
    var currentTotalMinutes = currentHours * 60 + currentMinutes;

    // Start- en eindtijd omzetten naar minuten voor vergelijking
    var [startHours, startMinutes] = startTime.split(":").map(Number);
    var [endHours, endMinutes] = endTime.split(":").map(Number);

    var startTotalMinutes = startHours * 60 + startMinutes;
    var endTotalMinutes = endHours * 60 + endMinutes;

    // Vergelijking van de tijden (controleer of huidige tijd tussen start en eind ligt)
    if (currentTotalMinutes >= startTotalMinutes && currentTotalMinutes <= endTotalMinutes) {
        console.log("✅ Tijd is binnen het ingestelde bereik. Record wordt verwerkt.");
        // Aanroep naar de backend om record te verwerken (bijv. /execute route)
        connection.trigger('executeAction', { action: 'process' });  // Je kunt dit aanpassen naar je eigen implementatie
    } else {
        console.log("❌ Tijd is NIET binnen het ingestelde bereik. Record wordt vastgehouden.");
        // Aanroep naar de backend om record vast te houden (bijv. /execute route)
        connection.trigger('executeAction', { action: 'hold' });  // Ook hier kun je het aanpassen
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

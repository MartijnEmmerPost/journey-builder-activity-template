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

    connection.on('initActivity', initialize);
    connection.on('requestedTokens', onGetTokens);
    connection.on('requestedEndpoints', onGetEndpoints);
    connection.on('requestedInteraction', onRequestedInteraction);
    connection.on('requestedTriggerEventDefinition', onRequestedTriggerEventDefinition);
    connection.on('requestedDataSources', onRequestedDataSources);

    connection.on('clickedNext', save);
   
    // Render functie wanneer de pagina klaar is
    function onRender() {
        // JB will respond the first time 'ready' is called with 'initActivity'
        connection.trigger('ready');

        // Verzoek om benodigde gegevens zoals tokens, endpoints, interaction, enz.
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

    // Initialisatie van de activiteit, wanneer de gegevens geladen worden
    function initialize(data) {
        console.log('Initializing activity:', data);
        if (data) {
            payload = data;
        }
        
        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : {};

        // Start- en eindtijden invullen als ze bestaan
        $('#start-time').val(inArguments.startTime || '');
        $('#end-time').val(inArguments.endTime || '');

        connection.trigger('updateButton', {
            button: 'next',
            text: 'done',
            visible: true
        });
    }

    // Functie om de tokens op te halen
    function onGetTokens(tokens) {
        console.log('Tokens ontvangen:', tokens);
        authTokens = tokens;
    }

    // Functie om de endpoints op te halen
    function onGetEndpoints(endpoints) {
        console.log('Endpoints ontvangen:', endpoints);
    }

    // Functie om de gegevens op te slaan wanneer "Next" is geklikt
    function save() {
        // Verkrijg de waarden voor starttijd en eindtijd
        var startTime = $('#start-time').val();
        var endTime = $('#end-time').val();

        // Vul de inArguments met de juiste waarden
        payload['arguments'].execute.inArguments = [{
            "tokens": authTokens,
            "startTime": startTime,
            "endTime": endTime
        }];
        
        // Markeer de activiteit als geconfigureerd
        payload['metaData'].isConfigured = true;

        // Log het hele payload object om te zien of alles correct wordt doorgegeven
        console.log('Saving activity:', payload);

        // Update de activiteit in Journey Builder
        connection.trigger('updateActivity', payload);
    }
});

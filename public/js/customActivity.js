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
   
    function onRender() {
        // JB will respond the first time 'ready' is called with 'initActivity'
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

        // Controleer of we al start- en eindtijden hebben opgeslagen in inArguments
        $('#start-time').val(inArguments.startTime || '');
        $('#end-time').val(inArguments.endTime || '');

        connection.trigger('updateButton', {
            button: 'next',
            text: 'done',
            visible: true
        });
    }

    function onGetTokens(tokens) {
        console.log('Tokens ontvangen:', tokens);
        authTokens = tokens;
    }

    function onGetEndpoints(endpoints) {
        console.log('Endpoints ontvangen:', endpoints);
    }

    // Opslaan van de tijden bij klikken op "Done"
    function save() {
        var startTime = $('#start-time').val();
        var endTime = $('#end-time').val();

        // Voeg start- en eindtijden toe aan de inArguments
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

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

    // Event triggers
    connection.on('initActivity', initialize);
    connection.on('requestedTokens', onGetTokens);
    connection.on('requestedEndpoints', onGetEndpoints);
    connection.on('requestedInteraction', onRequestedInteraction);
    connection.on('requestedTriggerEventDefinition', onRequestedTriggerEventDefinition);
    connection.on('requestedDataSources', onRequestedDataSources);
    connection.on('clickedNext', save);  // The 'Done' button handler

    // Render method that is called when the window is ready
    function onRender() {
        connection.trigger('ready');
        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');
        connection.trigger('requestInteraction');
        connection.trigger('requestTriggerEventDefinition');
        connection.trigger('requestDataSources');  
    }

    // Handling data sources request
    function onRequestedDataSources(dataSources) {
        console.log('*** requestedDataSources ***');
        console.log(dataSources);
    }

    // Handling interaction request
    function onRequestedInteraction(interaction) {    
        console.log('*** requestedInteraction ***');
        console.log(interaction);
    }

    // Handling event definition request
    function onRequestedTriggerEventDefinition(eventDefinitionModel) {
        console.log('*** requestedTriggerEventDefinition ***');
        console.log(eventDefinitionModel);
    }

    // Initialize method that runs when the activity is first initialized
    function initialize(data) {
        console.log('Initializing with data:', data);
        
        if (data) {
            payload = data;
        }

        // Check if inArguments exists in the payload
        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : {};

        // Load startTime and endTime if available in inArguments
        $('#start-time').val(inArguments.startTime || '');
        $('#end-time').val(inArguments.endTime || '');

        // Update the button to say "done"
        connection.trigger('updateButton', {
            button: 'next',
            text: 'done',
            visible: true
        });
    }

    // Tokens requested
    function onGetTokens(tokens) {
        console.log('Received tokens:', tokens);
        authTokens = tokens;
    }

    // Handling endpoints request
    function onGetEndpoints(endpoints) {
        console.log('Received endpoints:', endpoints);
    }

    // Save the times when 'Done' is clicked
    function save() {
        // Get the start and end times from the input fields
        var startTime = $('#start-time').val();
        var endTime = $('#end-time').val();

        // Ensure that inArguments is populated with the correct times
        payload['arguments'].execute.inArguments = [{
            "startTime": startTime,
            "endTime": endTime
        }];
        
        // Indicate that the activity is configured
        payload['metaData'].isConfigured = true;

        // Log the payload for debugging
        console.log('Payload to be saved:', payload);

        // Trigger the updateActivity event to save the data
        connection.trigger('updateActivity', payload);
    }
});

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
        connection.trigger('ready');
        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');
        connection.trigger('requestInteraction');
        connection.trigger('requestTriggerEventDefinition');
        connection.trigger('requestDataSources');
    }

    function initialize(data) {
        console.log('🔄 Activity data ontvangen:', data);
        if (data) {
            payload = data;
        }

        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payload['arguments'].execute.inArguments[0] : {};

        console.log('📥 InArguments:', inArguments);

        // Haal start- en eindtijd op als deze al zijn opgeslagen
        $('#start-time').val(inArguments.startTime || '');
        $('#end-time').val(inArguments.endTime || '');

        connection.trigger('updateButton', {
            button: 'next',
            text: 'done',
            visible: true
        });
    }

    function save() {
        console.log('💾 Opslaan van activiteit...');

        var startTime = $('#start-time').val();
        var endTime = $('#end-time').val();

        payload['arguments'].execute.inArguments = [{
            "tokens": authTokens,
            "startTime": startTime,
            "endTime": endTime
        }];

        payload['metaData'].isConfigured = true;

        console.log('📤 Payload versturen:', payload);
        connection.trigger('updateActivity', payload);
    }
});

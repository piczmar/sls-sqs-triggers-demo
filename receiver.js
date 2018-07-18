'use strict';
var AWS = require('aws-sdk');
var sqs = new AWS.SQS({
    region: 'us-east-1'
});

exports.handler = (event, context, callback) => {

    var accountId = context.invokedFunctionArn.split(":")[4];
    var queueUrl = 'https://sqs.us-east-1.amazonaws.com/' + accountId + '/MyQueue2';

    // SQS message parameters
    var params = {
        AttributeNames: [
            "SentTimestamp"
        ],
        MaxNumberOfMessages: 1,
        MessageAttributeNames: [
            "All"
        ],
        QueueUrl: queueUrl,
        VisibilityTimeout: 0,
        WaitTimeSeconds: 0
    };

    var statusCode = 500;
   
    sqs.receiveMessage(params, function(err, data) {
        var listOfMessages = [];
        if (err) {
            console.log('error:', "failed to get message" + err);
        } else if (data.Messages) {
            statusCode = 200;

            data.Messages.forEach((message) => {
                console.log("Message:", message);

                listOfMessages.push(message.Body);
                var deleteParams = {
                    QueueUrl: queueUrl,
                    ReceiptHandle: message.ReceiptHandle
                };
                sqs.deleteMessage(deleteParams, function(err, data) {
                    // TODO: should handle errors better, like retry
                    if (err) {
                        console.log("Delete Error", err);
                    } else {
                        console.log("Message Deleted", data);
                    }
                });

            });

        }

        var response = {
            statusCode: statusCode,
            body: JSON.stringify({
                message: 'Go Serverless v1.0! Your function executed successfully!',
                input: listOfMessages,
            }),
        };

        console.log('received messages', listOfMessages);
        callback(null, response);

    });

    // https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html
    //https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/sqs-examples.html
    //https://stackoverflow.com/questions/49597630/aws-lambda-sqs-processing-whole-queue-at-once
};
"use strict";

const aws = require("aws-sdk");
const _ = require("lodash");
const env = require("./config");

const QUEUE_URL = env.sqs.queueUrl;

// AWS Configuration
aws.config.update(env.aws);

// SQS 객체 생성
const sqs = new aws.SQS(env.sqs.apiVersion);

const PARAMS = {
  QueueUrl: QUEUE_URL,
  VisibilityTimeout: 10,
  MaxNumberOfMessages: 10,
};

/**
 * SQS에서 받은 메시지를 콘솔에 출력한다.
 **/
function onReceiveMessage(messages) {
  // if (_.isNil(messages.Messages) === false) {
  //   messages.Messages.forEach(message => {
  //     console.log(message.Body);
  //     return message.Body
  //   });
  // }

  let msg = JSON.parse(messages.Messages[0].Body);
  let msg2 = msg.Records[0].s3.object.key;
  return msg2;
}

/**
 * SQS에서 받은 메시지를 삭제한다.
 **/
function deleteMessages(messages) {
  if (_.isNil(messages.Messages)) {
    return;
  }

  // SQS 삭제에 필요한 형식으로 변환한다.
  const entries = messages.Messages.map((msg) => {
    return {
      Id: msg.MessageId,
      ReceiptHandle: msg.ReceiptHandle,
    };
  });

  // 메시지를 삭제한다.
  return sqs
    .deleteMessageBatch({
      Entries: entries,
      QueueUrl: QUEUE_URL,
    })
    .promise();
}

// sqs.receiveMessage(PARAMS).promise()
//   .then(onReceiveMessage)
//   // .then(deleteMessages)
//   .catch(error => {
//     console.error(error);
//   });

exports.receiver = async (params) => {
  let sqsMessagesArray = [];
  try {
   
    const { Messages } = await sqs
      .receiveMessage({
        QueueUrl: QUEUE_URL,
        VisibilityTimeout: 100,
        MaxNumberOfMessages: 3,
      })
      .promise();

    Messages.map((msg) => {
      const pushedMsg = JSON.parse(msg.Body).Records[0].s3.object.key
      sqsMessagesArray.push(pushedMsg)
    });

    if (Messages === undefined) {
      throw new Error("대기열에 메시지가 존재하지 않습니다.");
    }

    const entries = Messages.map((msg) => {
      return {
        Id: msg.MessageId,
        ReceiptHandle: msg.ReceiptHandle,
      };
    });
    sqs
      .deleteMessageBatch({
        Entries: entries,
        QueueUrl: QUEUE_URL,
      })
      .promise();

    return sqsMessagesArray;
  } catch (err) {
    throw new Error(err);
  }
};
// const { Messages } = await sqs.receiveMessage(params).promise();

// return Messages

// const aa = receiver(PARAMS);

// console.log(aa)

'use strict';

const aws = require('aws-sdk');
const env = require('./config.js');

const QUEUE_URL = env.sqs.queueUrl;

// AWS Configuration
aws.config.update(env.aws);

// SQS 객체 생성
const sqs = new aws.SQS(env.sqs.apiVersion);

const PARAMS = {
  QueueUrl: "https://sqs.ap-northeast-2.amazonaws.com/766430376209/TestQueue2",
  MessageBody: 'Hello World!',
  DelaySeconds: 0,
};
 
exports.sendSQS = (PARAMS) => {
    sqs.sendMessage(PARAMS).promise()
  .then(() => { console.log('Message 전송 성공'); })
  .catch(error => { console.error(error); });
}; 

exports.presignedUrl_S3 = async (objectkey, owner_uid, test_tid) => {

  const AWS = require('aws-sdk');

  AWS.config.update(env.aws);

  const s3 = new AWS.S3()
  const URL_EXPIRATION_SECONDS = 30000    // Specify how long the pre-signed URL will be valid for

  try {

      const Key = `${objectkey}.mp4`

      const s3Params = {
          Bucket: "mybucket-aws-hands-on",
          Key : Key,
          Expires: URL_EXPIRATION_SECONDS,
          ContentType: 'video/mp4', // Change this to the media type of the files you want to upload
      };

      return new Promise((resolve, reject) => {
          // Get signed URL
          let uploadURL = s3.getSignedUrl('putObject', s3Params)
          resolve({
              "statusCode": 200,
              "isBase64Encoded": false,
              "headers": {
                  "Access-Control-Allow-Origin": "*",
                  'Access-Control-Allow-Headers': '*',
                  "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                  "Content-Type": "*/*"
              },
              "body": {
                  uploadURL: uploadURL,
                  filename: Key
              }
          })
      })

  } catch (err) {
      throw new Error("Presigned Url S3 - Upload Post URL issued fail ")
  } finally {

  }

}

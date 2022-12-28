'use strict';

const express = require('express');
const app = express();
const { receiver }= require("./receiver");
const { presignedUrl_S3 } = require("./sender");
const env = require('./config');

// const PARAMS = {
//     QueueUrl: env.sqs.queueUrl,
//     VisibilityTimeout: 10
//   };

app.get('/', async (req, res) => {
    try{
    const PARAMS = {
        QueueUrl: env.sqs.queueUrl,
        VisibilityTimeout: 10
      };
    const receive = await receiver(PARAMS);
    // const a = receive[0]
    // const encodeVideoName = JSON.parse(a.Body).Records[0].s3.object.key
  

    // console.log("receive : ", receive);

    return res.send(receive);
    }catch (err) {
        console.log(err)
        return res.status(500).send({
            ERROR : err
        })
    }
});

app.post("/upload", async (req, res) => {

    const objectKey = req.body;

    const url = await presignedUrl_S3(objectKey);

    return res.send(url)
});

app.listen(3000, () => {
    console.log("Server On Port :3000")
})
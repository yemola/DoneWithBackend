const config = require("config");
const fs = require("fs");
const S3 = require("aws-sdk/clients/s3");

const bucketName = config.get("aws-bucket-name");
const region = config.get("aws-bucket-region");
const accessKeyId = config.get("aws-access-key");
const secretAccessKey = config.get("aws-secret-key");

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

// uploads a file from s3
function uploadFile(file) {
  const fileStream = fs.createReadStream(file.path);

  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename,
  };

  return s3.upload(uploadParams).promise();
}

exports.uploadFile = uploadFile;

// downloads a file from s3

https://donebucket1.s3.eu-central-1.amazonaws.com/
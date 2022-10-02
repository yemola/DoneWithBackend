const config = require("config");
const fs = require("fs");
const { S3 } = require("aws-sdk");

const bucketName = config.get("aws-bucket-name");
const region = config.get("aws-bucket-region");
const accessKeyId = config.get("aws-access-key");
const secretAccessKey = config.get("aws-secret-key");

// uploads a file to s3

exports.s3Uploadv2 = async (files) => {
  const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey,
  });

  const params = files.map((file) => {
    // const fileStream = fs.createReadStream(file.path);
    return {
      Bucket: bucketName,
      Body: file.buffer,
      Key: `${file.filename}`,
      ACL: "public-read",
    };
  });

  return await Promise.all(params.map((param) => s3.upload(param).promise()));
};

// downloads a file from s3

exports.getFileStream = async (imagePath) => {
  const downloadParam = {
    Key: imagePath,
    Bucket: bucketName,
  };

  return s3.getObject(downloadParam).createReadStream();
};

// `${file.key}`

// https://donebucket1.s3.eu-central-1.amazonaws.com/

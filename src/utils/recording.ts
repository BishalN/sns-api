import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

async function toggleVisibility(bucket: string, key: string) {
  const params = {
    Bucket: bucket,
    Key: key,
  };

  const acl = await s3.getObjectAcl(params).promise();
  const isPublic = acl.Grants?.some(
    (grant) =>
      grant.Permission === "READ" &&
      grant?.Grantee?.URI === "http://acs.amazonaws.com/groups/global/AllUsers"
  );

  if (isPublic) {
    await makePrivate(bucket, key);
  } else {
    await makePublic(bucket, key);
  }
}

async function makePublic(bucket: string, key: string) {
  const params = {
    Bucket: bucket,
    Key: key,
    ACL: "public-read",
  };

  await s3.putObjectAcl(params).promise();
  console.log(`File ${key} is now public.`);
}

async function makePrivate(bucket: string, key: string) {
  const params = {
    Bucket: bucket,
    Key: key,
    ACL: "private",
  };

  await s3.putObjectAcl(params).promise();
  console.log(`File ${key} is now private.`);
}

async function generatePresignedUrl(
  bucket: string,
  key: string,
  expiresIn: number = 60 * 30 // 30 minutes by default
) {
  const params = {
    Bucket: bucket,
    Key: key,
    Expires: expiresIn, // URL expiration time in seconds
  };

  const url = await s3.getSignedUrlPromise("getObject", params);
  return url;
}

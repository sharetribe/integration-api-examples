// This dotenv import is required for the `.env` file to be read
require('dotenv').config();

const flexIntegrationSdk = require('sharetribe-flex-integration-sdk');

// Read image file path and user email from arguments

const filePath = process.argv[2];
if (!filePath) {
  console.log('File path is missing, one needs to be provided as the first argument, exiting.');
  process.exit(1);
}

const email = process.argv[3];
if (!email) {
  console.log('User email address is missing, one needs to be provided as the second argument, exiting.');
  process.exit(1);
}

const integrationSdk = flexIntegrationSdk.createInstance({

  // These two env vars need to be set in the `.env` file.
  clientId: process.env.FLEX_INTEGRATION_CLIENT_ID,
  clientSecret: process.env.FLEX_INTEGRATION_CLIENT_SECRET,

  // Normally you can just skip setting the base URL and just use the
  // default that the `createInstance` uses. We explicitly set it here
  // for local testing and development.
  baseUrl: process.env.FLEX_INTEGRATION_BASE_URL || 'https://flex-integ-api.sharetribe.com',
});

/*
  Upload an image, fetch user ID, and update the user's profile image.

  In this example the image is passed to the SDK by giving the image file path
  as the `image` attribute. Note that the image attribute can also be passed as
  a readable Node stream:

  ```
  const fs = require('fs');
  const stream = fs.createReadStream(filePath);
  integrationSdk.images.upload({image: stream});
  ```
 */

Promise.all([
  integrationSdk.images.upload({ image: filePath }),
  integrationSdk.users.show({email}),
]).then(([image, user]) => {

  const imageId = image.data.data.id;
  const userId = user.data.data.id;

  return integrationSdk.users.updateProfile({
    id: userId,
    profileImageId: imageId
  });
}).then(() => console.log(`Profile image updated for user ${email}`));

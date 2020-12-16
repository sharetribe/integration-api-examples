// This dotenv import is required for the `.env` file to be read
require('dotenv').config();

const flexIntegrationSdk = require('sharetribe-flex-integration-sdk');

// Read user email from arguments
const email = process.argv[2];

if (!email) {
  console.log('User email is missing, one needs to be provided as the first argument, exiting.');
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

// Fetch user ID and update the metadata of the user
integrationSdk.users.show({email})
  .then(res => {
    const userId = res.data.data.id;
    return integrationSdk.users.updateProfile(
      {
        id: userId,
        metadata: { verified: true },
      },
      {
        expand: true,
        'fields.user': ['email', 'profile.metadata'],
      });
  })
  .then(res => {
    const attrs = res.data.data.attributes;
    console.log(`Metadata updated for user ${attrs.email}`);
    console.log(`Current metadata: ${JSON.stringify(attrs.profile.metadata, null, 2)}`);
  });

// This dotenv import is required for the `.env` file to be read
require('dotenv').config();

const flexIntegrationSdk = require('sharetribe-flex-integration-sdk');

const integrationSdk = flexIntegrationSdk.createInstance({
  // These two env vars need to be set in the `.env` file.
  clientId: process.env.FLEX_INTEGRATION_CLIENT_ID,
  clientSecret: process.env.FLEX_INTEGRATION_CLIENT_SECRET,

  // Normally you can just skip setting the base URL and just use the
  // default that the `createInstance` uses. We explicitly set it here
  // for local testing and development.
  baseUrl: process.env.FLEX_INTEGRATION_BASE_URL || 'https://flex-integ-api.sharetribe.com',
});

// Create mock listings for demo purposes. Replace this listings array
// with real listings from e.g. an external integration. Make sure the 
// user ids refer to existing users within Flex.
const listings = [];
const title = 'Listing #';
const description = 'Listing created with Integration API';
const userId = 'add-valid-user-id-here';
const max = 105;

for (let i = 0; i < max; i++) {
  const count = i + 1;
  listings.push({
      title: `${title}${count}`,
      description: `${description}`,
      authorId: userId,
      state: 'published',
        price: { amount: 10000, currency: "USD" },
      metadata: {
        extId: count
      }
    });
}

// The listing creation endpoint has a rate limit of
// 100 queries per minute. Define the wait time as milliseconds.
const wait = 1000 * 60;

const requestAndRetry = (sdkCall, ...params) => {
  sdkCall(...params)
  .then(resp => {
    // Process successful creation further, if necessary
    console.log('\n resp after success: ', resp)
  })
  .catch(e => {
    // 429 Too Many Requests indicates we need to wait before we retry
    if (e.status === 429) {
      console.log('waiting!');

      setTimeout(() => {
        console.log('waiting done after ', wait)
        requestAndRetry(sdkCall, ...params)
      }, wait)
    }
  })
}

// Create the listings in Flex
for (let listing of listings) {
  requestAndRetry(integrationSdk.listings.create, listing, { expand: true })
}

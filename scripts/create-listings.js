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

const timeout = 500;

const createWithTimeouts = (fns, resolve, reject, results = []) => {
  const [firstFn, ...restFns] = fns;
  console.log('Remaining items: ',  fns.length)
  if (firstFn) {
    firstFn()
      .then(res => {
        setTimeout(() => {
          createWithTimeouts(restFns, resolve, reject, [...results, res]);
        }, timeout);
      })
      .catch(res => {
        reject([...results, res]);
      })
  } else {
    resolve(results)
  }
}

const createListings = new Promise((resolve, reject) => {
  const fns = listings.map(listing => () => {
    return integrationSdk.listings.create(listing, { expand: true });
  });

  createWithTimeouts(fns, resolve, reject);
})

createListings
  .then(res => {
    console.log('Successfully created: ');
    console.log(res);
  })
  .catch(e => {
    console.log('Error occurred: ', e)
  });

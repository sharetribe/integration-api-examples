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

const ordered = process.argv[2];

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
// 100 queries per minute. Define the wait times in milliseconds.
const timeout = 600; // Pause between listing creation
const wait = 1000 * 60; // Wait a full minute in case response indicates Too Many Requests

// Default option:
// Create listings and maintain their relative order. Listings are created with
// pauses in between to avoid hitting rate limit, however if the timeout value is reduced,
// the function waits for a longer time in case of a 429 Too Many Requests error.
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
        if (res.status === 429) {
          console.log('Rate limit exceeded, waiting...')
          setTimeout(() => {
            console.log('Resuming listing creation')
            createWithTimeouts(fns, resolve, reject, results);
          }, wait)
        } else {
          reject([...results, res]);
        }
      })
  } else {
    resolve(results)
  }
}

// Map listings as an array of SDK calls for createWithTimeouts function
const createListingsWithTimeouts = () => new Promise((resolve, reject) => {
  const fns = listings.map(listing => () => {
    return integrationSdk.listings.create(listing, { expand: true });
  });

  createWithTimeouts(fns, resolve, reject);
})

// Non-ordered option (run script with '--ordered=false')
// Create listings in bulk without maintaining their respective order. 
// In case the rate limit (100 listings per minute) for the endpoint is hit, wait for a minute and retry.
const createWithRetry = (listing) => {
  integrationSdk.listings.create(listing, { expand: true })
  .then(resp => {
    // Process successful creation further, if necessary
    console.log('Successfully created: ', resp)
  })
  .catch(e => {
    // 429 Too Many Requests indicates we need to wait before we retry
    if (e.status === 429) {
      console.log('Waiting due to too many requests...');

      setTimeout(() => {
        createWithRetry(listing)
      }, wait)
    } else {
      console.log('Error when creating listings: ', e)
    }
  })
}


// With no arguments, listings are created with pauses in between and
// their respective order is maintained. With argument '--ordered=false',
// listings are created with no ordering.
if (ordered === '--ordered=false') {
  for (let listing of listings) {
    createWithRetry(listing)
  }
} else {
  createListingsWithTimeouts()
    .then(res => {
      console.log('Successfully created: ');
      console.log(res);
    })
    .catch(e => {
      console.log('Error occurred: ', e)
    });
}

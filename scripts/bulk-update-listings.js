// This dotenv import is required for the `.env` file to be read
require('dotenv').config();

const sharetribeIntegrationSdk = require('sharetribe-flex-integration-sdk');

// Read dry run from arguments
const dryRun = process.argv[2];

// Create rate limit handler for queries.
// NB! If you are using the script in production environment,
// you will need to use sharetribeIntegrationSdk.util.prodQueryLimiterConfig
const queryLimiter = sharetribeIntegrationSdk.util.createRateLimiter(
  sharetribeIntegrationSdk.util.devQueryLimiterConfig
);

// Create rate limit handler for commands.
// NB! If you are using the script in production environment,
// you will need to use sharetribeIntegrationSdk.util.prodCommandLimiterConfig
const commandLimiter = sharetribeIntegrationSdk.util.createRateLimiter(
  sharetribeIntegrationSdk.util.devCommandLimiterConfig
);

const integrationSdk = sharetribeIntegrationSdk.createInstance({

  // These two env vars need to be set in the `.env` file.
  clientId: process.env.FLEX_INTEGRATION_CLIENT_ID,
  clientSecret: process.env.FLEX_INTEGRATION_CLIENT_SECRET,

  // Pass rate limit handlers
  queryLimiter: queryLimiter,
  commandLimiter: commandLimiter,

  // Normally you can just skip setting the base URL and just use the
  // default that the `createInstance` uses. We explicitly set it here
  // for local testing and development.
  baseUrl: process.env.FLEX_INTEGRATION_BASE_URL || 'https://flex-integ-api.sharetribe.com',
});

// Takes `fns` array of functions and executes them sequentially.
const bulkUpdate = (fns, resolve, reject, results = []) => {
    const [firstFn, ...restFns] = fns;
    if (firstFn) {
      firstFn()
          .then(res => {
            bulkUpdate(restFns, resolve, reject, [...results, res]);
          })
          .catch(res => {
              reject([...results, res]);
          });
    } else {
        resolve(results);
    }
}

// Fetch all listings in marketplace and analyze how many of them need to be updated.
const analyze = integrationSdk.listings.query()
  .then(res => {
      console.log('Total listing count:', res.data.meta.totalItems)
      const dayBased = res.data.data.filter(listing => {
          const plan = listing.attributes.availabilityPlan;
          return plan === null ||
              plan.type === 'availability-plan/day';
      });
      console.log('Listings to migrate:', dayBased.length);
      return dayBased;
  });

if (dryRun === '--dry-run=false') {
  analyze
    .then(dayBasedListings => {
      return new Promise((resolve, reject) => {

          // Wrap calls to integration API in a function, that will be later
          // executed by the bulkUpdate function.
          const fns = dayBasedListings.map(listing => () => {

              console.log('Updating listing', listing.id.uuid)
              return integrationSdk.listings.update({
                  id: listing.id,
                  availabilityPlan: {
                      type: 'availability-plan/time',
                      timezone: 'Europe/Helsinki',
                      entries: [
                          {dayOfWeek: 'mon', startTime: '00:00', endTime: '00:00', seats: 1},
                          {dayOfWeek: 'tue', startTime: '00:00', endTime: '00:00', seats: 1},
                          {dayOfWeek: 'wed', startTime: '00:00', endTime: '00:00', seats: 1},
                          {dayOfWeek: 'thu', startTime: '00:00', endTime: '00:00', seats: 1},
                          {dayOfWeek: 'fri', startTime: '00:00', endTime: '00:00', seats: 1},
                          {dayOfWeek: 'sat', startTime: '00:00', endTime: '00:00', seats: 1},
                          {dayOfWeek: 'sun', startTime: '00:00', endTime: '00:00', seats: 1}
                      ]}
              });

          });

          // Execute
          bulkUpdate(fns, resolve, reject);
      });
  })
  .then(res => {
      console.log('Successfully updated:')
      console.log(res);
  });
} else {
    analyze.then(() => {
        console.log('To execute bulk update, run this command with --dry-run=false option')
    });
}

// This dotenv import is required for the `.env` file to be read
require('dotenv').config();

const sharetribeIntegrationSdk = require('sharetribe-flex-integration-sdk');

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
  clientId: process.env.SHARETRIBE_INTEGRATION_CLIENT_ID,
  clientSecret: process.env.SHARETRIBE_INTEGRATION_CLIENT_SECRET,

  // Pass rate limit handlers
  queryLimiter: queryLimiter,
  commandLimiter: commandLimiter,

  // Normally you can just skip setting the base URL and just use the
  // default that the `createInstance` uses. We explicitly set it here
  // for local testing and development.
  baseUrl: process.env.SHARETRIBE_INTEGRATION_BASE_URL || 'https://flex-integ-api.sharetribe.com',
});


const formatMoney = money => {
  const { amount, currency } = money;
  if (currency === 'USD') {
    return `\$${(amount / 100).toFixed(2)}`;
  }
  if (currency === 'EUR') {
    return `${(amount / 100).toFixed(2)}€`;
  }
  return 'unknown currency';
};

// 24 hours ago
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

Promise.all([
  integrationSdk.marketplace.show(),
  integrationSdk.users.query({
    createdAtStart: yesterday,
    'fields.user': ['email']
  }),
  integrationSdk.listings.query({
    states: ['published'],
    'fields.listing': ['title', 'price'],
    perPage: 3,
  }),
]).then(([marketplace, users, listings]) => {
  const { name } = marketplace.data.data.attributes;
  console.log(`To: team@example.com`);
  console.log(`bcc: ${users.data.data.map(u => u.attributes.email).join(', ')}`);
  console.log(`Subject: Welcome to ${name}!`);
  console.log('');
  console.log('Checkout some of the recently published listings:');
  listings.data.data.forEach(listing => {
    const { title, price } = listing.attributes;
    console.log(`\n${title}, ${formatMoney(price)}:`);
    console.log(`https:example.com/l/${listing.id.uuid}`);
  });

  console.log('');
  console.log('If you have any questions, feel free to contact us by responding to this email.');
  console.log('');
  console.log('Cheers,');
  console.log(`${name} Team`);
});

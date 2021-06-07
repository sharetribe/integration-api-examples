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

const totalItems = response => {
  return response.data.meta.totalItems;
};

// Let's query minimal data of different resources just to see the
// response metadata.
const minimalOptions = {
  'fields.user': 'none',
  'fields.listing': 'none',
  'fields.transaction': 'none',
  perPage: 1,
};

const now = new Date();
const currentMonthStart = new Date(now.getFullYear(), now.getMonth());

Promise.all([
  integrationSdk.marketplace.show(),

  // All users, listings, and transactions
  //
  integrationSdk.users.query(minimalOptions),
  integrationSdk.listings.query(minimalOptions),
  integrationSdk.transactions.query(minimalOptions),

  // Listings in different states
  //
  integrationSdk.listings.query({
    states: ['draft'],
    ...minimalOptions,
  }),
  integrationSdk.listings.query({
    states: ['pendingApproval'],
    ...minimalOptions,
  }),
  integrationSdk.listings.query({
    states: ['published'],
    ...minimalOptions,
  }),
  integrationSdk.listings.query({
    states: ['closed'],
    ...minimalOptions,
  }),

  // New users, listings, and transactions this month
  integrationSdk.users.query({
    createdAtStart: currentMonthStart,
    ...minimalOptions,
  }),
  integrationSdk.listings.query({
    createdAtStart: currentMonthStart,
    ...minimalOptions,
  }),
  integrationSdk.transactions.query({
    createdAtStart: currentMonthStart,
    ...minimalOptions,
  }),
]).then(([
  marketplace,

  users,
  listings,
  transactions,

  draftListings,
  pendingListings,
  publishedListings,
  closedListings,

  newUsers,
  newListings,
  newTransactions,
]) => {

  const { name } = marketplace.data.data.attributes;
  console.log(`================ ${name} analytics ================`);
  console.log('');
  console.log(`Listings: ${totalItems(listings)}`);
  console.log(` - ${totalItems(draftListings)} draft(s)`);
  console.log(` - ${totalItems(pendingListings)} pending approval`);
  console.log(` - ${totalItems(publishedListings)} published`);
  console.log(` - ${totalItems(closedListings)} closed`);
  console.log('');
  console.log(`Users: ${totalItems(users)}`);
  console.log(`Transactions: ${totalItems(transactions)}`);
  console.log('');
  console.log(`This month, starting from ${currentMonthStart.toDateString()}:`);
  console.log(` - ${totalItems(newUsers)} new user(s)`);
  console.log(` - ${totalItems(newListings)} new listing(s)`);
  console.log(` - ${totalItems(newTransactions)} new transaction(s)`);
});

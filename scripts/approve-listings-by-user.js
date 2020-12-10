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

// Query params for listings query
const listingsQueryParams = authorId => ({
  authorId,
  states: ['pendingApproval'],
  'fields.listing': 'state',
});

// Query params for approve listing request
const listingsApproveParams = {
  expand: true,
  'fields.listing': 'title',
};

// Request approve for a listing
const approveListing = listing => {
  return integrationSdk.listings.approve({ id: listing.id },
                                         listingsApproveParams);
};

// Log title and id of all listings in an API response
const logApprovedListing = response => {
  const listing = response.data.data;
  console.log(`Approved listing: ${listing.attributes.title} (${listing.id.uuid})`);
};

// Fetch user ID, fetch user's all listings, and approve them one by one
integrationSdk.users.show({email})
  .then(res => {
    const userId = res.data.data.id;
    return integrationSdk.listings.query(listingsQueryParams(userId));
  })
  .then(res => Promise.all(
    res.data.data.map(approveListing)
  ))
  .then(responses => responses.forEach(logApprovedListing));

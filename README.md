# Sharetribe Flex Integration API examples

This repository contains example Node.js scripts using the Sharetribe
Flex Integration API.

You can use this repo to connect to your own Flex marketplace, and
print out information of it using the examples. The examples can also
work as a baseline for your own integration scripts.

## Getting started

1. Install required tools:

- [Node.js](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/docs/install)

2. Clone this repository:

```bash
git clone git@github.com:sharetribe/flex-integration-api-examples.git
```

3. Change to the cloned directory:

```bash
cd flex-integration-api-examples
```

4. Install dependencies:

```bash
yarn install
```

5. Copy the environment configuration template:

```bash
cp env-template .env
```

6. Set the client application details in the `.env` configuration file:

```bash
FLEX_INTEGRATION_CLIENT_ID=paste-application-client-id-here
FLEX_INTEGRATION_CLIENT_SECRET=paste-application-client-secret-here
```

To get a client ID and secret, create a new application in Console:

https://flex-console.sharetribe.com/applications

Note: you don't need to use the `.env` file, you can also just set the
environment variables in your shell. Using the env file is just a
convenient way to get started.

## Usage

All the scripts are in the [scripts/](scripts/) directory. You can use
Node to run them:

```bash
node scripts/script-name.js [options]
```

To test your setup, you can run the script to show the marketplace
information:

```bash
> node scripts/show-marketplace.js
Name: My Test marketplace
```

## Scripts reference

### Show marketplace

Prints information of the marketplace.

```bash
> node scripts/show-marketplace.js
Name: My Test marketplace
```

### Analytics

Prints information of the users, listings, and transactions of the
marketplace. Also prints out what new things have been added in the
current month.

```bash
> node scripts/analytics.js
================ My Test marketplace analytics ================

Listings: 20
 - 1 draft(s)
 - 1 pending approval
 - 17 published
 - 1 closed

Users: 14
Transactions: 9

This month, starting from Fri Nov 01 2019:
 - 1 new user(s)
 - 8 new listing(s)
 - 9 new transaction(s)
```

### Welcome email

Prints out an example email for newly joined users. The email welcomes
the new users and showcases a few recently published listings.

This could be extended into a script that is run periodically and that
actually sends the email to the listed users.

```bash
> node scripts/welcome-email.js
To: team@example.com
bcc: test2@example.com, test1@example.com
Subject: Welcome to Bikesoil!

Checkout some of the recently published listings:

Nishiki 401, $123.98:
https:example.com/l/9009efe1-25ec-4ed5-9413-e80c584ff6bf

Pelago Brooklyn, $123.33:
https:example.com/l/5e1f2086-522c-46f3-87b4-451c6770c833

Minnesota 2.0 Fat Bike - Lady, $63.12:
https:example.com/l/927a30a2-3a69-4b0d-9c2e-a41744488703

If you have any questions, feel free to contact us by responding to this email.

Cheers,
Bikesoil Team
```

### Update user metadata

Sets a `verified` attribute true in the metadata of a user. The user is defined
by passing an email address as the first parameter.

```
> node scripts/update-user-metadata.js john.doe@example.com
Metadata updated for user john.doe@example.com
Current metadata: {
  "verified": true
}
```

### Update profile image

Update a user's profile image. A image file is uploaded and attached to a user.
The uploaded image is defined by passing the file path as the first parameter.

```
> node scripts/update-profile-image.js /tmp/profile_image.jpg john.doe@example.com
Profile image updated for user john.doe@example.com
```

### Approve listings of a user

Approves all listings of a given user that are in the `pendingApproval` state.
The user is defined by passing an email address as the first parameter.

```
> node scripts/approve-listings-by-user.js john.doe@example.com                                                                               <<<
Approved listing: Sauna by a lake (9f3419cc-49aa-4877-ac5b-7b25248414ef)
Approved listing: Electric city sauna (9009efe1-25ec-4ed5-9413-e80c584ff6bf)
```

### New listing notifications using events

Prints out information about new published listings or listings pending approval
(if your marketplace is configured with listing approval feature on). Uses
events to efficiently detect new listings or changes in the listings' state.

```
> node scripts/notify-new-listings.js
```

The script runs until interrupted. Create some listings in your marketplace
while the script is running to see output.

### Bulk update listings

Script to bulk update listings' day-based availability plans to time-based
plans. The bulk update executes API requests sequentially with a proper timeout
so that the script doesn't trigger API rate-limiting.

To dry run the script, run:

```
> node scripts/bulk-update-listings.js
```

If you really want to run the script (please note, this will really update all the listings in your marketplace!), use `--dry-run=false` option.

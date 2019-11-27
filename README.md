# Sharetribe Flex Integration API examples

This repository contains example Node.js scripts using the Sharetribe
Flex Integration API.

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
Description: This is the description for my test marketplace.
```

## Scripts reference

### Show marketplace

Prints information of the marketplace.

```bash
> node scripts/show-marketplace.js
Name: My Test marketplace
Description: This is the description for my test marketplace.
```

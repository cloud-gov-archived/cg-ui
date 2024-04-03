# Cloud.gov UI prototype

This is a prototype for a future Cloud.gov user interface.

The repository is based on a starter template for [Learn Next.js](https://nextjs.org/learn).

It requires Node version 18 or higher.

## Development

### A note on zscaler

If zscaler is active in your environment, you must make Node aware of your zscaler certificate by setting the `NODE_EXTRA_CA_CERTS` variable. This only needs to be done once.

First output the zscaler certificate in pem format:

```
security find-certificate -a -c zscaler -p > zscaler_root_ca.pem
```

After exporting that .pem, add `export NODE_EXTRA_CA_CERTS=path/to/zscaler_root_ca.pem` to your .zshrc / .bashrc / whatever. That will fix SSL issues during npm install.

### Prerequisites

To access Cloud Foundry data, you must set the following environment variables:

```
CF_API_URL=[your Cloud foundry api url, including https:// and /v version]
CF_API_TOKEN=[your Cloud Foundry oauth token, including the "bearer" prefix]
```

For CAPI requests to work, the url and token must be compatible. For example, you cannot use a development url and a production token together.

To obtain your token, first log into the correct environment in your CLI:

```
cf login -a [your cf domain] --sso
```

Then run:

```
cf oauth-token
```

Copy this token and set it as your `CF_API_TOKEN` variable.

Note that oauth tokens expire frequently. To obtain a new token, just run `cf oauth-token` again and replace your previous variable value with the new one.

Also note that depending on your role, you may not be able to access all Cloud Foundry endpoints.

For storing local environment variables, create a `.env.local` file in the project root. Do not check this file into source control. For more info, see [NextJS docs: Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables).

### Running locally

In this directory, run this to install dependencies:
```bash
npm install
```

Start the database Docker container:

```bash
cd cgui-db-docker
docker-compose build
docker-compose up
```

Copy `.env.example.local` to `.env.local`. You should not need to adjust it.

Then run the dev server:

```bash
npm run dev
```

See results at `http://localhost:3000`

### Testing

Start your docker database container. You will need this running for tests which manipulate the database:

```
docker-compose up
```

To run the entire test suite:

```
npm test
```

To run test files matching certain text (one example):
```
npm test -- serverside
```

### Linting

To run eslint and prettier:
```
npm run lint
```

Eslint configurations are found in [.eslintrc.json](./.eslintrc.json).

Prettier configurations are found in [.prettierrc.json](./.prettierrc.json).

We are using [husky](https://typicode.github.io/husky/) to manage the linting pre-commit hook, as well as to manage which files are run through the linter. To change which directories are included in linting, go to [.lintstagedrc.js](./.lintstagedrc.js).

### Authentication (development)

Authentication functionality relies on the app talking to a UAA server. See the [README](../../uaa-docker/README.md) in the `uaa-docker` directory for instructions on how to run this server locally with Docker.

Authentication also relies on certain environment variables. Locally, these will be set in your `.env.local` file. Examples can be found in [.env.test](./.env.test), or talk to a team member to obtain them.

Authentication business logic is found in NextJS [middleware](./middleware.js).

## Working with USWDS

In order to control when we upgrade USWDS, the `@uswds/uswds` npm package has been installed using the `--save-exact` flag.

### SASS

By default, NextJS has a way of compiling SASS, as well as Autoprefixer. This eliminates the need to use tools like uswds-compile or Gulp.

SASS compilation configs can be found in [next.config.js](./next.config.js)

USWDS theme settings can be configured in [assets/stylesheets/uswds-settings.scss](./assets/stylesheets/uswds-settings.scss).

The global SASS entrypoint is [assets/stylesheets/styles.scss](./assets/stylesheets/styles.scss)

Our aim is to import only what we need from USWDS. Individual USWDS packages will be listed in `styles.scss` after the `uswds-core` import.

### Javascript and Images

Nextjs has a top-level [public folder](https://nextjs.org/docs/app/building-your-application/optimizing/static-assets) where static assets can be stored. Assets stored here can be used as `src` urls by removing the `/public` prefix.

#### Examples:
```
// Folder: /public/img/uswds/icon.png

<img src="/img/uswds/icon.png" />

// Folder: /public/js/uswds/uswds.min.js

<Script src="/js/uswds/uswds.min.js" />
```

After a USWDS npm package update, copy the following files from `node_modules/@uswds/uswds/dist/` to `/public`:

```
/public
  /js
    /uswds
      - uswds-init.js
      - uswds-init.min.js
      - uswds-init.min.js.map
      - uswds.js
      - uswds.min.js
      - uswds.min.js.map
  /img
    /uswds
      - [any images from uswds that you need]
```

For ease of updating, use the same file names. (This process could be converted to a script down the road.)

## Deployment

Log into the cloud.gov environment of your choice. Follow the prompts after the below command to authenticate and select an appropriate environment (likely your sandbox account).

```bash
# production
cf login -a api.fr.cloud.gov --sso
```

### Create a database

If you have already deployed to this space before, you probably already have a database and can skip this step!

```bash
cf create-service aws-rds micro-psql cgui-datastore
```

Wait several minutes for your database to be created. You will know it is ready when the following shows `cgui-datastore` with a last operation of "create succeeded".

```bash
cf services
```

Now you will need to make sure that your Cloud.gov space's application security group (ASG) is set up so that your RDS service will be able to talk to your application. Print out all your security groups and look for the ones assigned to your current org and space.

```bash
cf security-groups
```

You will need both the `public_networks_egress` (for your application to talk to the internet) and `trusted_local_networks_egress` (for your database to talk to your application).
P
If you do not see these security groups active for your space, add them by subbing in your org (probably `sandbox-gsa`) and your space (likely the first part of your email).

```bash
cf bind-security-group trusted_local_networks_egress [org] --space [space]
```

You do not need to manually bind the database. This is being done in the `manifest.yml` file.

### Configure

Copy `.env.cloud.example.yml` to `.env.cloud.yml`. This file contains information that will be passed to the `manifest.yml` file. Change the name of the application to something unique, and confirm that the name you selected for the database is correct.

### Push

Now you're ready to deploy your application! From the base of the nextjs application directory:

```bash
cf push --vars-file=.env.cloud.yml
```

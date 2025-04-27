## Description

### Configuration

After checkout of a repository, please perform the following steps:

1. Copy docker-compose.override

   ```
   $ cp docker-compose.override.yml.dist docker-compose.override.yml
   ```

2. Create `.env` file from `.env.dist` and update the values in your `.env`
   ```
   $ cp .env.dist .env
   ```
3. Run `npm i`

##

### Dev setup

This app is fully dockerized, so in order to use it you have to have `docker` and `docker-compose` installed. You also need to have `npm` in order to run npm scripts.

1. In order to run the whole app in watch mode for dev purpose, type:

   ```bash
   npm run start:dev
   ```

2. If you need to destroy all containers run:

   ```bash
   npm run docker:down
   ```

3. To get into Docker container's shell:

   ```bash
   npm run docker:shell
   ```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## REST API

 It should be available locally under:

```bash
http://localhost:3000/api
```
Swagger documentation is available under:

```bash
http://localhost:3000/api-docs
```


### Architecture

- Split functionalities into **features**
- A single **feature** is a set of functionalities bound by a single context, for example all endpoints related to task management or everything related to users.
- Follow CQS approach with addittion of **command bus** and **query bus**

# Crypto-trader api

API for finwo's crypto trader project

## Installation

```bash
$ npm install
```

## Running the app

This app is not designed to be run in a stand-alone manner. It requires the
presence of a database, making the easiest way to start it by using
docker-compose in the root of the monorepo for this project.

```bash
docker-compose up --build --remove-orphans
```

Running this command will start listening on port 80 of you machine, assuming
you have permissions to do so, and will respond to the `api.docker` domain as
defined in the docker-compose.yml file.

If you're not able to set up dnsmasq or another form of dns server that allows
you to register a top-level-domain on your local machine, there are ports
directly mapping to services as well.

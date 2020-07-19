# Basin

Extract, transform, load using visual programming that can run Spark jobs on any environment

Create and debug from your browser and export into pure python code!

![Basin screenshot](https://github.com/zalmane/superglue-ui/blob/master/doc/basin_screenshot.png?raw=true)

# Features

- Up and running as simple as `docker pull`

- Create complex pipelines and flows using drag and drop

- Debug and preview step by step

- Integrated dataview grid viewer for easier debugging

- Auto-generates comments so you don't have to

- Export to beautiful, pure python code

- Build artifacts for AWS Glue deployment (Work in progress)

# Install

## Install from dockerhub
`$ docker pull zalmane/basin:latest`

### Create data folder

`$ mkdir data`
This is the folder that will hold all input and output files

### Run image
Run image mapping data directory to your local environment. This is where input/output goes (extract and load)

`docker run --rm -d -v $PWD/data:/opt/superglue/data --name basin_server -p 3000:3000 zalmane/basin:latest`

That's it. Point your browser to [http://localhost:3000](http://localhost:3000) and you're done!

Notes:
- Metadata is stored in the browser's indexeddb.

## Install from source
### Install dev environment with docker
```
docker-compose up
```

This will set up 2 containers: `basin-client` and `basin-server`

To run npm commands in the basin-client container use:
```
docker exec basin-client npm <command>
```

### Installing a Jupyter pyspark backend

The easiest way to spin up a pyspark container is to use Docker along with the predefined official Jupyter containers.
A convenience Dockerfile is provided in this repository that extends the Jupyter container to run a preconfigured Jupyter server

To build:
```
docker build -t superglue/server .
```

Then run the server:
```
docker run -it -p 9007:8888 superglue/server
```

# Getting started

## Creating sources
A source defines the information needed to parse and import a dataset. Sources are referenced when using an *Extract* block.
The source defines the following information:
- type of file (delimited, fixed width, json, parquet)
- regular expression to match when identifying the file. This will match against the file name
- information about headers and footers
- specific metadata based on type of file (for csv includes the delimiter etc)

## Creating a flow

## Running and debugging a flow

## Exporting to python code

# Configuration

# Extending
## Creating new block types

Each block type consists of:

- Descriptor json
- code template
- optional code library template
- Properties panel

### Descriptor
### Code template
### Ccode library template
### Properties panel

# License

This program is free software: you can redistribute it and/or modify it under the terms of the Server Side Public License, version 1, as published by MongoDB, Inc. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the Server Side Public License for more details. You should have received a copy of the Server Side Public License along with this program. If not, see <http://www.mongodb.com/licensing/server-side-public-license>
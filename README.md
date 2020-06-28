# Basin

Extract, transform, load using visual programming that can run Spark jobs on any environment

Create and debug from your browser and export into pure python code!

![Basin screenshot](https://github.com/zalmane/superglue-ui/blob/master/doc/basin_screenshot.png?raw=true)

# Install

## Install from docker

## Install from source
```
npm install
```
## Installing a Jupyter pyspark backend

### Using Docker
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

## Install from source

## Getting started

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

# Features

## Dataview inspector

## Auto-generates comments so you don't have to

## Export to Python

## Build for AWS Glue


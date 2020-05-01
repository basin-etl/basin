# superglueui

# Project setup
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

## Configuration
The first this runs it will pull all dependencies and install locally. 


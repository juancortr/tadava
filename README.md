# TADAVA MiddleWare repository

## Architecture description, frameworks used and general description.

TADAVA is a middleware that enables sampling, summarize and exploration of table-based datasets to provide the user with a representative and understandable sample of the data. Currently TADAVA has a backend in ElasticSearch and uses Navio as the main visualization widget.

This repository contains a forked, modified version of [Navio](https://github.com/john-guerra/navio/) in which a Tadava endpoint can be used for large datasets (more than 200MB). 
Tadava middleware code resides in ./TadavaMiddleware. It connects to backend frameworks and implements sampling techniques to enable quick visualization in Navio of large data respositories. Navio uses Tadava endpoints to use its sampling capacities.

The folder ./DataSampling contains the scripts for big datasets generation using python's package [Faker](https://github.com/joke2k/faker)] that were loaded to Elasticsearch for sampling testing.

To use Tadava you will have to:
1. Load your data to Elasticsearch using the script and instructions provided [here](https://github.com/john-guerra/elasticSearchExperiments/blob/master/DataSampling/indicemapping.md), where the index and mapping requirements to load data into the cluster.
2. Set Tadava's URL endpoint and relevant columns to visualize in Navio in the file TadavaMiddleware/public/javascripts/navio_set.js
3. Go to folder TadavaMiddleware and start the server:
````
execute node app
```

# TADAVA MiddleWare repository

## Architecture description, frameworks used and general description.

TADAVA is a middleware that enables sampling, summarize and exploration of table-based datasets to provide the user with a representative and understandable sample of the data. Currently TADAVA has a backend in ElasticSearch and uses Navio as the main visualization widget.

This repository contains a forked, modified version of [Navio - Shipyard](https://github.com/john-guerra/navio/) in which a Tadava endpoint can be chosen for large datasets (more than 200MB). 
Tadava middleware code resides in ./TadavaMiddleware. It connects to different backend frameworks and implements sampling techniques to enable quick visualization in Navio of large data respositories. Navio uses Tadava endpoints to use its sampling capacities.
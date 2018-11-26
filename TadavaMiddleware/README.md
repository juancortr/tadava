# TADAVA
This experiment integrates visualization widget [Navio](https://github.com/john-guerra/NodeNavigator) and backends on Elasticsearch through web experiments.

The repository includes Tadava middelware in Node.js with the query scripting and sampling techniques and a modified version of Navio to be used with tadava in /public/javascripts/navio.



The file /public/javascripts/navio_set.js is used to set tadava's URL, the index used and to specify the columns to be loaded by Navio and their type.

## API Routes o deployed application
Main post endpoint used to send Navio's filter stack and obtain a sample for the last filter (current filter)
- **/post/:index**

Sample 600 records on natural order
- **/index?[sample=X]**
Sample 600 sorting by att1 within range
- **/index/att1?[from=][& to=+][&sample=600]** 



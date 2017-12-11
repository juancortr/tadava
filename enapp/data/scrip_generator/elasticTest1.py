import signal
import sys

# Using argparse to parse cli arguments
import argparse

# Import threading essentials
from threading import Lock, Thread, Condition, Event

# For randomizing
import string
from random import randint, choice

# To get the time
import time

# For misc
import sys

# For json operations
import json

# Try and import elasticsearch
try:
    from elasticsearch import Elasticsearch

except:
    print("Could not import elasticsearch..")
    print("Try: pip install elasticsearch")
    sys.exit(1)

es = Elasticsearch(['http://caoba-access.virtual.uniandes.edu.co:8083/'])

samplesize = 10000

def test(indice, it, step,datasetSize, the_file):
	infdistrlim = float(step)/datasetSize
	print(infdistrlim)
	bodyS = """{
	              min_score: 0.5,
	              size:"""+ str(samplesize)+""",
	              track_scores:true,
	              _source: ["id"],
	              query: {
	               function_score: {
	                query: {
	                  function_score:{
	                    functions:[{
	                      random_score: {
	                      }
	                    }]
	                  }
	                },
	                functions: [
	                  {
	                    script_score:{
	                      script: {
	                        params:{
	                          param1:"""+ str(infdistrlim)+"""
	                        },
	                        inline: "if (_score.doubleValue() < param1){return 1;} else {return 0;}"
	                      }
	                    }
	                  }
	                ]
	                ,boost_mode:"replace"
	              }
	            }
	          } """
	res = es.search(index=indice, doc_type="basicdata", body=bodyS, sort=["id"])
	#print(res['_source'])
	#print(str(len(res['hits']['hits']))+','+res['hits'][res['hits'].keys()[0]]['_index'])
	if(len(res['hits']['hits'])==0):
		linea =   indice+','+str(it)+','+str(step)+','+str(len(res['hits']['hits']))+','+str(res['took'])
	else:
		linea = str(res['hits']['hits'][0]['_index'])+','+str(it)+','+str(step)+','+str(len(res['hits']['hits']))+','+str(res['took'])
	print(linea)
	the_file.write(linea+'\n')

def main():
	#iteraciones = [1, 5, 10, 20, 50 ,100]
	iteraciones = [1, 5, 10]
	indices = []
	steps = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 10000, 20000, 50000, 100000, 200000, 500000]
  	#datasetSizes = [100, 1000, 10000, 100000, 500000,1000000, 5000000, 10000000]
	datasetSizes = [100, 1000, 10000]
	for e in datasetSizes:
		with open('py_sample_'+str(e)+'.txt', 'a') as the_file:
			for it in iteraciones:
				for st in steps:
					for x in range(0,it):
						test('sample_'+str(e), it, st, e, the_file)

#test('sample_100', 50,100)
main()

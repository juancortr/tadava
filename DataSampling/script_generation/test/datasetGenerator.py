#!/usr/bin/env python

import sys
import os
import json
import csv
import codecs

from faker import Faker

fake = Faker('en_US')

esurl = "your_escluster_url"

#samples = [100, 1000, 10000, 100000, 500000, 1000000, 5000000, 10000000]

#Samples para el analisis de arquitectura de 1, 3 y 5 nodos
#samples2 = [100000, 500000, 1000000, 5000000, 10000000]
#samples2 = [7000000,8000000, 10000000, 15000000, 12000000]
samples = [7000000,8000000, 10000000, 15000000, 12000000]
#samples = [15000000]

#samples2 = [7000000,8000000, 15000000, 12000000]
#samples = [10000000]
samples2 = []
#samples = [7000000,8000000, 15000000, 12000000]

ruta = "../data/scrip_generator/sample_"

def loadSamples():
	for elem in samples:
		print('Loading samples...'+str(elem))
		#comando = "elasticsearch_loader --es-host http://157.253.236.37:8083 --index sample_"+str(elem)+"_module --type basicdata csv "+ruta+str(elem)+".txt"
		
		#Comando para resultados senado
		comando = "elasticsearch_loader --es-host "+esurl+" --index "+indiceV+" --type text csv "+ruta
		print("Comando: "+comando)
		os.system(comando)
	for elem3 in samples2:
		print('Loading 3-samples...'+str(elem3))
		comando = "elasticsearch_loader --es-host "+esurl+" --index sample_"+str(elem3)+"_3 --type basicdata csv "+ruta+str(elem3)+".txt"
		os.system(comando)
	for elem5 in samples2:
		print('Loading 5-samples...'+str(elem5))
		comando = "elasticsearch_loader --es-host "+esurl+" --index sample_"+str(elem5)+"_5 --type basicdata csv "+ruta+str(elem5)+".txt"
		os.system(comando)

def createMappings():
	for elem in samples:
		print('Creating mapping for '+str(elem))
		#Sentencia para dataset generado
		#sentencia = "curl -XPOST 157.253.236.37:8083/sample_"+str(elem)+" -d '{\"settings\" : {\"number_of_shards\" : 1 },\"mappings\" : {\"basicdata\" : {\"properties\" : {\"id\" : { \"type\" : \"integer\", \"index\" : \"not_analyzed\" },\"first_name\" : { \"type\" : \"string\", \"index\" : \"not_analyzed\" },\"last_name\" : { \"type\" : \"string\", \"index\" : \"not_analyzed\" },\"married\" : { \"type\" : \"boolean\"},\"ip\" : { \"type\" : \"string\", \"index\" : \"not_analyzed\" },\"calification\" : { \"type\" : \"double\"},\"posts\" : { \"type\" : \"long\" },\"date\" : {\"type\":\"date\", \"format\": \"yyyy-MM-dd HH:mm:ss\" }}}}}'"
		
		#Sentencia para otras resultados senado
		sentencia = "curl -XPOST "+esurl+"/"+indiceV+" -d "+mappingFuente;
		os.system(sentencia)
	for elem in samples2:
		print('Creating mapping for '+str(elem)+' in 3 node')
		sentencia = "curl -XPOST "+esurl+"/sample_"+str(elem)+"_3 -d '{\"settings\" : {\"number_of_shards\" : 5 },\"mappings\" : {\"basicdata\" : {\"properties\" : {\"id\" : { \"type\" : \"string\", \"index\" : \"not_analyzed\" },\"first_name\" : { \"type\" : \"string\", \"index\" : \"not_analyzed\" },\"last_name\" : { \"type\" : \"string\", \"index\" : \"not_analyzed\" },\"married\" : { \"type\" : \"boolean\"},\"ip\" : { \"type\" : \"string\", \"index\" : \"not_analyzed\" },\"calification\" : { \"type\" : \"double\"},\"posts\" : { \"type\" : \"long\" },\"date\" : {\"type\":\"date\", \"format\": \"yyyy-MM-dd HH:mm:ss\" }}}}}'"
		os.system(sentencia)
	for elem in samples2:
		print('Creating mapping for '+str(elem))
		sentencia = "curl -XPOST "+esurl+"/sample_"+str(elem)+"_5 -d '{\"settings\" : {\"number_of_shards\" : 5 },\"mappings\" : {\"basicdata\" : {\"properties\" : {\"id\" : { \"type\" : \"string\", \"index\" : \"not_analyzed\" },\"first_name\" : { \"type\" : \"string\", \"index\" : \"not_analyzed\" },\"last_name\" : { \"type\" : \"string\", \"index\" : \"not_analyzed\" },\"married\" : { \"type\" : \"boolean\"},\"ip\" : { \"type\" : \"string\", \"index\" : \"not_analyzed\" },\"calification\" : { \"type\" : \"double\"},\"posts\" : { \"type\" : \"long\" },\"date\" : {\"type\":\"date\", \"format\": \"yyyy-MM-dd HH:mm:ss\" }}}}}'"
		os.system(sentencia)

def generateDatasets():
	for elem in samples:
		print('Generating Random data for '+str(elem))
		limit = elem
		file = codecs.open('sample_'+str(elem)+'.txt', 'a', 'ascii')

		#print(dir(fake))
		file.write("id,first_name,last_name,married,ip,calification,posts,date\n")

		for i in range(0, limit):
			ligne = str(i+1)+','+fake.first_name()+','+fake.last_name()+','+str(fake.boolean())+','+fake.ipv4()+','+str(fake.pyfloat(1, 2))+','+str(fake.random_number(4))+','+str(fake.date_time_this_decade())+"\n"
			file.write(ligne)
		file.close()

createMappings()
generateDatasets()
loadSamples()

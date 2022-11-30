#!/usr/bin/env python3

from __future__ import print_function
from Encoder import Encode
import sys
import time
import math
import csv
import asn1tools
import random
from time import sleep
from SingleLine import stringer
#from Sender import Send_ITS
from threading import Thread
import Sender as send
import optparse
from proton.reactor import Container


def MsgCreator(foo_cam,foo_denm,DENM_string,Geo_DENM,coords,length,opts,args):
	while True:
		longitude = coords.strip().split(', ')[0]
		longitude = longitude.strip().split('.')[0] + longitude.strip().split('.')[1]
		latitude = coords.strip().split(', ')[1]
		latitude = latitude.strip().split('.')[0] + latitude.strip().split('.')[1]
		
		#Creating the current timestamp in ETSI format
		epoch = 1072915200 #Epoch wrt to 2004-01-01 00:00:00
		start_time_denm = (time.time()-epoch)*1000
		start_time_denm = round(start_time_denm)

		#Replace referenceTime
		DENM = DENM_string.replace("529855984591",str(start_time_denm))
		#Replace Latitude and Longitude
		DENM = DENM.replace("110432171",longitude) 
		DENM = DENM.replace("459188269",latitude)
		#Replacing the stationID
		#DENM = DENM.replace("4028591367","4028591367")
		
		Encoded = Encode(DENM,foo_denm)
		Encoded = Geo_DENM + Encoded 
		print("DENM")
		
		
		#Sender
		try:
			send.Container(send.Send(opts.address,Encoded)).run()
		except KeyboardInterrupt: pass 


		time.sleep(0.1)
		

if __name__ == "__main__":

	#Compile .asn files
	foo = asn1tools.compile_files('./Data/ETSI_CAM_1.4.1.asn','uper')
	foo_2 = asn1tools.compile_files('./Data/ETSI_DENM_v1.3.1.asn','uper') 

	#Opening messages fils 
	f_denm = open('./Data/DENM_V2.txt','r')
	DENM_string = stringer(f_denm)
	f_denm.close() 

	#Geonetworking_DENM
	Geo_DENM = bytes.fromhex("01000501204001800086020040EE000014008CFDF01F6D075DE0B1E41AD7568A0493157686B801FB1AD761200493217E004600000000000007D20000")
	#Geo_DENM = bytes.fromhex("01000501204201800086020040EE000014008CFDF01F6D075DE0B1E41AD7568A0493157686B801FB1AD7AC84049344B00046000A000C000007D20000")
	#Latitude & Longitude
	latitude = "45.0322720"
	longitude = "7.6751230"
	length = 1
	coords = longitude + ", " + latitude

	#Optoparse address
	parser = optparse.OptionParser(usage="usage: %prog [options]",
									description="Send messages to the supplied address.")
	#parser.add_option("-a", "--address", default="130.192.30.241:5672/topic://rainbow.project.links.polito.denm.1.2.3",   
	#					help="address to which messages are sent (default %default)")
	parser.add_option("-a", "--address", default="130.192.30.241:5672/topic://Rainbow.project.demo.denm.producer.test",   
						help="address to which messages are sent (default %default)")
	opts, args = parser.parse_args()


	t = Thread(target=MsgCreator, args=(foo,foo_2,DENM_string,Geo_DENM,coords,length,opts,args))
	t.daemon = True			   
	snooziness = int(input("Enter the amount of seconds the alert should be active: "))
	t.start()
	
	try:
		sleep(snooziness)
	except KeyboardInterrupt:
		quit()




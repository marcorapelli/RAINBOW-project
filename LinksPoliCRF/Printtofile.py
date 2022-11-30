#!/usr/bin/env python
from __future__ import print_function
import pprint
import time
import datetime
import re
import math
import pandas as pd
from Indent import indent


def print_cam(name,decoded_data,latency):
    if name != "":
        namef = "./Data/" + name + ".txt"
        with open(namef,'a') as file_out:
            #decoded_pp = indent(decoded_data) # Pretty prints decoded data
            file_out.write("CAM Message:\n" + str(decoded_data) + "\n")
    else:
        decoded_data=str(decoded_data)
        print("CAM: ", decoded_data)
        print("\n")
        
        tofind="'latitude': "
        start=decoded_data.find(tofind)
        end=decoded_data.find(",",start)
        latitude=decoded_data[start+len(tofind):end]
        latitude=latitude[:-7] + "." + latitude[-7:]
        
        tofind="'longitude': "
        start=decoded_data.find(tofind)
        end=decoded_data.find(",",start)
        longitude=decoded_data[start+len(tofind):end]
        longitude=longitude[:-7] + "." + longitude[-7:]
        
        tofind="'stationID': "
        start=decoded_data.find(tofind)
        end=decoded_data.find("}",start)
        stationID=decoded_data[start+len(tofind):end]
        
        socket_msg=str(latency) + ";" + "CAM;" + latitude + ";" + longitude + ";" + stationID
        
        return socket_msg

def print_denm(name,decoded_data,latency,output):
    if name != "":
        namef = "./Data/" + name + ".txt" 
        with open(namef,'a') as file_out:
            #decoded_pp = indent(decoded_data)
            file_out.write("DENM message:\n"+ str(decoded_data) + "\n")
    else: #If flag is set to 0 we print to console
        #decoded_pp = indent(decoded_data)
        decoded_data=str(decoded_data)
        print("DENM: ", decoded_data)
        print("\n")
        
        tofind="'latitude': "
        start=decoded_data.find(tofind)
        end=decoded_data.find(",",start)
        latitude=decoded_data[start+len(tofind):end]
        latitude=latitude[:-7] + "." + latitude[-7:]

        tofind="'longitude': "
        start=decoded_data.find(tofind)
        end=decoded_data.find(",",start)
        longitude=decoded_data[start+len(tofind):end]
        longitude=longitude[:-7] + "." + longitude[-7:]
        
        tofind="'originatingStationID': "
        start=decoded_data.find(tofind)
        end=decoded_data.find(",",start)
        stationID=decoded_data[start+len(tofind):end]
        
        tofind="'validityDuration': "
        start=decoded_data.find(tofind)
        end=decoded_data.find(",",start)
        duration=decoded_data[start+len(tofind):end]
        
        stationLat=output[0].strip()
        stationLat=stationLat[:-7] + "." + stationLat[-7:]
        stationLon=output[1].strip()
        stationLon=stationLon[:-7] + "." + stationLon[-7:]
        areaShape=output[4].strip()
        areaLat=output[2].strip()
        areaLat=areaLat[:-7] + "." + areaLat[-7:]
        areaLon=output[3].strip()
        areaLon=areaLon[:-7] + "." + areaLon[-7:]
        areaDistA=output[5].strip()
        areaDistB=output[6].strip()
        areaAngle=output[7].strip()
        
        outputStr=stationLat + "," + stationLon + "," + areaShape + "," + areaLat + "," + areaLon + "," + areaDistA + "," + areaDistB + "," + areaAngle + "," + duration
        
        socket_msg=str(latency) + ";" + "DENM;" + latitude + ";" + longitude + ";" + stationID + ";" + outputStr
        
        return socket_msg  

def print_finder(name,msgType,decoded_data,latency,output):
    msg = 'null'
    if msgType == 1:
        msg = print_cam(name,decoded_data,latency)
    else:
        msg = print_denm(name,decoded_data,latency,output)

    return msg



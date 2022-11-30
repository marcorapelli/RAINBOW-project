#!/usr/bin/env python

import socket
import struct 
import time

def grafana_send_cam(start):
    end = time.time()

    epoch = 1072915200 
    timestampITS = (end-epoch)*1000
    end = round(timestampITS%65536)
    if end < start:
        end += 65536
    else:
        pass
    latency = end-start
    MESSAGE = str(latency)
    UDP_IP = "130.192.30.241"
    UDP_PORT = 5005
    sock = socket.socket(socket.AF_INET,socket.SOCK_DGRAM)

    bufferSize = 1024
    bytesTosend = MESSAGE.encode("utf-8")
    
    sock.sendto(bytesTosend, (UDP_IP, UDP_PORT))

    return int(latency)



def grafana_send_denm(start):

    epoch = 1072915200 #Epoch wrt to 2004-01-01 00:00:00
    end = round((time.time()-epoch)*1000)
    if end-start < 0:
        end = end+100000000000 #move next time instant
        latency = end-start
    else:
        latency = end-start
        
    MESSAGE = str(latency)
    UDP_IP = "130.192.30.241"
    UDP_PORT = 5005
    sock = socket.socket(socket.AF_INET,socket.SOCK_DGRAM)

    bufferSize = 1024
    bytesTosend = MESSAGE.encode("utf-8")
    
    sock.sendto(bytesTosend, (UDP_IP, UDP_PORT))

    return int(latency)


def cityaggregator_send(msg):
	#print(msg)
	UDP_IP = "130.192.30.241"
	UDP_PORT = 8008
	sock = socket.socket(socket.AF_INET,socket.SOCK_DGRAM)
	
	bufferSize = 1024
	bytesTosend = msg.encode("utf-8")
	
	sock.sendto(bytesTosend, (UDP_IP, UDP_PORT))



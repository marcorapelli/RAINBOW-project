#!/usr/bin/env python3

from __future__ import print_function
import optparse
import sys
import os
import time
import re
import Printtofile
import asn1tools
from proton.handlers import MessagingHandler
from proton.reactor import Container
from Decoder import Decoder
from UDPSender import grafana_send_cam, grafana_send_denm, cityaggregator_send



class Recv(MessagingHandler):
    def __init__(self, url, namefile,foo2,foo):
        super(Recv, self).__init__()
        self.url = url
        self.namefile = namefile
        self.foo = foo
        self.foo2 = foo2
        
    def on_start(self, event):
        event.container.create_receiver(self.url)
        
    def on_message(self, event):
        Received_hex = event.message.body.hex() #Obtains hex message
        
        cmd = "../GNdecoder/GeoNetDecoder " + Received_hex
        stream = os.popen(cmd)
        output = stream.readlines()
        msg_hex=output[-1].strip().lower()
        
        (decoded_data,msgType) = Decoder(msg_hex,self.foo2,self.foo) #Decodes bytearray into text and prettyprints it           
        if msgType == 0:
            items = re.findall("'detectionTime':\s([-+]?\d*\.*\d+)", str(decoded_data))
            start = int(items[0])
            #Used to measure end-to-end latency
            latency=grafana_send_denm(start)
        else:
            items = re.findall("'generationDeltaTime':\s([-+]?\d*\.*\d+)", str(decoded_data))
            start = int(items[0])
            #Used to measure end-to-end latency
            latency=grafana_send_cam(start)
        
        #Print to file
        Printtofile.print_finder(self.namefile,msgType,decoded_data,latency,output)

parser = optparse.OptionParser(usage="usage: %prog [options]")
#parser.add_option("-a", "--address", default="130.192.30.241:5672/topic://rainbow.project.polito.crf.denm.*.*.*",
#                  help="address from which messages are received (default %default)")
parser.add_option("-a", "--address", default="130.192.30.241:5672/topic://Rainbow.project.demo.denm.consumer.test",
                  help="address from which messages are received (default %default)")
parser.add_option("-o", dest="pfile", default="",
                  help="Print to file: -o NAMEFILE")

(opts, args) = parser.parse_args()

try:
    #Initializing .asn files
    foo2=asn1tools.compile_files('./Data/ETSI_DENM_v1.3.1.asn','uper') 
    foo=asn1tools.compile_files('./Data/ETSI_CAM_1.4.1.asn','uper')
    opts.foo2 = foo2
    opts.foo = foo
    print("Process started...")
    Container(Recv(opts.address,opts.pfile,opts.foo2,opts.foo)).run()
except KeyboardInterrupt: pass

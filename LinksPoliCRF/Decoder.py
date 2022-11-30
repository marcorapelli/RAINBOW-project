#!/usr/bin/env python

from __future__ import print_function
from Indent import indent
import Printtofile
import asn1tools
import time
import asn1 
import sys

def Decoder_DENM(DENM_msg,foo2):
  decoded_data=foo2.decode('DENM',bytes.fromhex(DENM_msg))
  return decoded_data;
  

def Decoder_CAM(CAM_msg,foo):
  decoded_data=foo.decode('CAM',bytes.fromhex(CAM_msg))
  return decoded_data;
	

def Decoder(Hex,foo2,foo):
  msg = Hex
  if msg[:4].find("0201") >=0:
    decoded_data=Decoder_DENM(msg,foo2)
    flag = 0
    return decoded_data,flag;
  elif msg[:4].find("0202") >=0:
    decoded_data=Decoder_CAM(msg,foo)
    flag = 1
    return decoded_data,flag;
  else:
    print("Unknown message type!")
        

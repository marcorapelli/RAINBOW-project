#!/usr/bin/env python

from __future__ import print_function
from SingleLine import stringer
import asn1tools
import ast 
import time

#Encoding for CAM messages
def Encoder_CAM(CAM_string,foo):
    CAM_array = ast.literal_eval(CAM_string) #Stores literals instead of string
    CAM_encoded = bytes(foo.encode('CAM',CAM_array))
    return CAM_encoded;
   
#Encoding for DENM messages
def Encoder_DENM(DENM_string,foo):
    DENM_array = ast.literal_eval(DENM_string) #Stores literals instead of string
    DENM_encoded = bytes(foo.encode('DENM',DENM_array))
    return DENM_encoded;
    

def Encode(string,foo):
    if string.find('denm') >= 0:
        Encoded = Encoder_DENM(string,foo)
        return Encoded;
    elif string.find('cam') >= 0:
        Encoded = Encoder_CAM(string,foo)
        return Encoded;
    else:
        print('String not recognized.\n')
        return;

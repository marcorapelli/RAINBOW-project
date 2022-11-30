#!/usr/bin/env python3

from __future__ import print_function
import string
import optparse
#From file to single line
def stringer(f):
    lines = f.readlines()
    mystr = '\t'.join([line.strip() for line in lines])
    mystr = " ".join(mystr.split())
    return mystr;

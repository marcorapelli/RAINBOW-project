#!/usr/bin/env python3

from __future__ import print_function
import string
import optparse
from pprint import pformat
from yapf.yapflib.yapf_api import FormatCode

def indent(ITS):
    string = pformat(ITS)
    formatted_code, _ = FormatCode(string)
    #print(formatted_code)
    return formatted_code;



#!/usr/bin//env python

from __future__ import print_function, unicode_literals
import string
import optparse
import asn1tools
import ast 
import time
from proton import Message
from proton.handlers import MessagingHandler
from proton.reactor import Container

class Send(MessagingHandler):
    def __init__(self, url,ITS):
        super(Send, self).__init__()
        self.url = url
        self.ITS = ITS
        self.sent = 0
        self.total = 1
    
    def on_start(self, event):
        event.container.create_sender(self.url)

    def on_sendable(self, event):
        if self.sent < self.total:
            msg = Message(id=0,body=self.ITS)
            event.sender.send(msg)
            self.sent += 1
            
    def on_accepted(self, event):
        #print("all messages confirmed")
        event.connection.close()

    def on_disconnected(self,event):
        #print("Disconnected")
        pass

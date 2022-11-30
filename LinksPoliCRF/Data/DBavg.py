#!/usr/bin/env python
from __future__ import print_function
import mysql.connector
from mysql.connector import Error
import datetime
import os
import socket
from io import StringIO
import pandas as pd
from pandas import DataFrame
import sys
import time
import numpy 
import decimal

def avgInsert(row,ts,mydb,cursor):
    try:
        if mydb.is_connected():
            data = row 
             #Finale table to be uploaded 
            #------Time------Latency----#
            #------data1------data1-----#   
            try:
                late = data
                tm = ts

                insertStatement = "INSERT INTO LatencyAverage (Timestamp,Latency) VALUES (%s, %s)"
                cursor.execute(insertStatement, (tm,late))

                mydb.commit()
                print('MySQL LatencyAvg insertion:',tm,late)

            except Error as e:
                print("An exception has occurred:{}".format(e))
                #sys.exit(0)
                time.sleep(5)  #sleep for 5 secs

        else:
            mydb =  mysql.connector.connect(host='130.192.30.241', database='Rainbow', user='RainbowUsr', password='RainbowPSWD', port=6666)
            cursor = mydb.cursor() 
            try:
                late = row
                tm = ts

                insertStatement = "INSERT INTO LatencyAverage (Timestamp,Latency) VALUES (%s, %s)"
                cursor.execute(insertStatement, (tm,late))

                mydb.commit()
                print('MySQL LatencyAvg insertion:',tm,late)

            except Error as e:
                print("An exception has occurred:{}".format(e))
                #sys.exit(0)
                time.sleep(5)  #sleep for 5 secs
            
            
    except Error as e:
        print("An exception has occurred:{}".format(e))
        #sys.exit(0)  



def insert(row,ts,mydb,cursor):
    try:
        if mydb.is_connected():
            data = row 
            


            #Finale table to be uploaded 
            #------Time------Latency----#
            #------data1------data1-----#   
            try:
                late = data
                tm = ts

                insertStatement = "INSERT INTO Latency (Timestamp,Latency) VALUES (%s, %s)"
                cursor.execute(insertStatement, (tm,str(late)))

                mydb.commit()
                print('MySQL Latency insertion:',tm,late)

            except Error as e:
                print("An exception has occurred here:{}".format(e),late)
                #sys.exit(0)
                time.sleep(5)  #sleep for 5 secs


            #tm = []     
        else:
            time.sleep(5)  #sleep for 5 secs

            mydb =  mysql.connector.connect(host='130.192.30.241', database='Rainbow', user='RainbowUsr', password='RainbowPSWD', port=6666)
            cursor = mydb.cursor() 
            try:
                late = row
                tm = ts

                insertStatement = "INSERT INTO Latency (Timestamp,Latency) VALUES (%s, %s)"
                cursor.execute(insertStatement, (tm,str(late)))

                mydb.commit()
                print('MySQL Latency insertion:',tm,late)

            except Error as e:
                print("An exception has occurred:{}".format(e))
                #sys.exit(0)
                time.sleep(5)  #sleep for 5 secs

                        
    except Error as e:
        print("An exception has occurred:{}".format(e))
        #sys.exit(0)
        time.sleep(5)  #sleep for 5 secs


def connect():
    UDP_IP = "130.192.30.241"
    UPD_PORT = 5005


    try:
        mydb =  mysql.connector.connect(host='130.192.30.241', database='Rainbow', user='RainbowUsr', password='RainbowPSWD', port=6666)

        cursor = mydb.cursor() 

        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM) #Datagram socket
        sock.bind((UDP_IP, UPD_PORT)) #binding it to the ip addr and port
        print("Listening...")

        while True:
            if mydb.is_connected():
                num = 0
                summ = 0
                start = time.time()
                while time.time() - start < 5:
                    data, addr = sock.recvfrom(1024)
                    if time.time() - start < 6:
                        msg = int(round(float(data)))
                        num+=1
                        summ+=msg
                        #print(time.time() - start,num,summ,data)

                        ts = datetime.datetime.utcnow()
                        insert(msg,ts,mydb,cursor)

                if num != 0:
                    avg = int(summ/num)
        
                    ts = datetime.datetime.utcnow()
                    avgInsert(avg,ts,mydb,cursor)
            else:
                break


    except Error as e:
        with open('log.txt', 'a') as fileWrite:
            fileWrite.write("{}; Exeception occured:{}".format(datetime.date.today(), e))
        time.sleep(5)  #sleep for 5 secs


if __name__ == "__main__":
    while True:
        connect()
        time.sleep(5)  #sleep for 5 secs



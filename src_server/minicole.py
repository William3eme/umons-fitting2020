import sys
import json
import os
import codecs

# import probfit
import  numpy
# from matplotlib import pyplot as plt
import numpy as  numpy
from iminuit import Minuit
from iminuit.cost import LeastSquares
try:

    uid = sys.argv [1]
    # print(os.getcwd())
    fit = {}
    with codecs.open("./files/{}.json".format(uid), "r" , "utf-8") as f:
        fit = json.loads(f.read())

    # Je récupère mes données brutes (rawdata)
    rawdata = list(fit["rawdata"]["data"])
    concentration  = float(fit["rawdata"]["concentration"])
    offset=0
    if(fit["rawdata"]["offset"]["type"]=="constant+"):
        offset = abs(float(fit["rawdata"]["offset"]["data"]))
    elif(fit["rawdata"]["offset"]["type"]=="constant-"):
        offset = -abs(float(fit["rawdata"]["offset"]["data"]))
    else:
        offset = (fit["rawdata"]["offset"]["data"])
    rawdata_x=[]
    rawdata_y=[]
    for element in rawdata:
        rawdata_x.append(element["x"])
        rawdata_y.append(element["y"])

    rawdata_x =  numpy.array(rawdata_x)
    rawdata_y =  numpy.array(rawdata_y)
    
    rawdata_y = rawdata_y/concentration+offset


    params = fit["model"]["params"]

    def line(x,COLED,COLEA,COLEFC,COLEB): 

        Q1 = x*1000000/COLEFC
        Q2 =  numpy.cos(3.1416*COLEB/4)
        R1 = COLED+(COLEA*(1+ numpy.power(Q1,(COLEB/2))*Q2))/(1+(2* numpy.power(Q1,(COLEB/2))*Q2)+ numpy.power(Q1,COLEB));  # Y de R1
        return COLED+(COLEA*(1+ numpy.power(Q1,(COLEB/2))*Q2))/(1+(2* numpy.power(Q1,(COLEB/2))*Q2)+ numpy.power(Q1,COLEB))
        

    data_yerr = 0.000001
    least_squares = LeastSquares(rawdata_x, rawdata_y, data_yerr, line)
    # pass starting values for a and b
    m = Minuit(least_squares,
    COLED=params["COLED"]["value"],
    COLEA=params["COLEA"]["value"],
    COLEFC=params["COLEFC"]["value"],
    COLEB=params["COLEB"]["value"],
    limit_COLED=(float(params["COLED"]["minM"]),float(params["COLED"]["maxM"])),
    limit_COLEA=(float(params["COLEA"]["minM"]),float(params["COLEA"]["maxM"])),
    limit_COLEFC=(float(params["COLEFC"]["minM"]),float(params["COLEFC"]["maxM"])),
    limit_COLEB=(float(params["COLEB"]["minM"]),float(params["COLEB"]["maxM"])),
    fix_COLED=params["COLED"]["fixed"],
    fix_COLEA=params["COLEA"]["fixed"],
    fix_COLEFC=params["COLEFC"]["fixed"],
    fix_COLEB=params["COLEB"]["fixed"],
    ) 

    m.migrad() # finds minimum of least_squares function
    m.hesse()  # computes errors 
    # m.minos()

    res = m.values.values()
    for i,element in enumerate(params):
        params[element]["value"] = res[i]




    with codecs.open("./files/{}.json".format(uid), 'w',"utf-8") as f:
        f.write(json.dumps(fit,ensure_ascii=False))
    print("OK")
    
except:
    print("PAS OK")
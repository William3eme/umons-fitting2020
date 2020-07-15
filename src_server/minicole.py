import sys
import json
import os
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
    with open("./files/{}.json".format(uid), 'r') as f:
        fit = json.loads(f.read())

    # Je récupère mes données brutes (rawdata)
    rawdata = list(fit["rawdata"]["data"])
    concentration  = float(fit["rawdata"]["concentration"])
    offset=0
    if(fit["rawdata"]["offset"]["type"]=="constant"):
        offset = float(fit["rawdata"]["offset"]["data"])
    else:
        offset = (fit["rawdata"]["offset"]["data"])
    rawdata_x=[]
    rawdata_y=[]
    for element in rawdata:
        rawdata_x.append(element["x"])
        rawdata_y.append(element["y"])

    rawdata_x =  numpy.array(rawdata_x)
    rawdata_y =  numpy.array(rawdata_y)

    rawdata_y = rawdata_y/concentration-offset
    # print("{} = {}".format(offset,type(offset)))
    # for i,e in enumerate(rawdata_y):
    #     print("{}= {} <br>".format(i,(e/concentration)-offset))


    params = fit["model"]["params"]

    def line(x,COLED,COLEA,COLEFC,COLEB): 

        Q1 = x*1000000/COLEFC
        Q2 =  numpy.cos(3.1416*COLEB/4)
        R1 = COLED+(COLEA*(1+ numpy.power(Q1,(COLEB/2))*Q2))/(1+(2* numpy.power(Q1,(COLEB/2))*Q2)+ numpy.power(Q1,COLEB));  # Y de R1
        return COLED+(COLEA*(1+ numpy.power(Q1,(COLEB/2))*Q2))/(1+(2* numpy.power(Q1,(COLEB/2))*Q2)+ numpy.power(Q1,COLEB))
        

    data_yerr = 0.000001
    least_squares = LeastSquares(rawdata_x, rawdata_y, data_yerr, line)
    # # pass starting values for a and b
    m = Minuit(least_squares,COLED=params["COLED"]["value"],COLEA=params["COLEA"]["value"],COLEFC=params["COLEFC"]["value"],COLEB=params["COLEB"]["value"], limit_COLED=(0.1, 9E1),limit_COLEA=(0.1, 6E1),limit_COLEFC=(1**3,2E8),limit_COLEB=(0.1,3)) 

    m.migrad() # finds minimum of least_squares function
    m.hesse()  # computes errors 

    res = m.values.values()
    for i,element in enumerate(params):
        params[element]["value"] = res[i]


    with open("./files/{}.json".format(uid), 'w') as f:
        f.write(json.dumps(fit))
    print("OK")
    # sys.exit(42)

# os.close(1)
except:
    print("PAS OK")
    # os.close(0)
    # exit(0)


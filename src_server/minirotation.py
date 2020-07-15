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


    params = fit["model"]["params"]
    # print(params)
    # for i,e in enumerate(params):
    #     print("{}= {}".format(i,e))


    def line(x,CONC,SOLV,PROPR,gl,SPIN,TAUV,TAUS0,TAUM,TAUR,dw,COUPL,distrot): 
        CMR = numpy.power(gl,2)*0.82286E-32*1*SPIN*(SPIN+1)*(numpy.power(distrot,-6))
        CMS = (2.*(6.2832*COUPL)*(6.2832*COUPL)*SPIN*(SPIN+1))/3
        freq1 = x * 2E6 * numpy.pi 
        freq2 = freq1 * 656 # tester 658
        TT = numpy.power(freq2*TAUV,2)
        TAUS1 = 5*TAUS0/((4/(1+4*TT)) + (1/(1+TT)))  #Tau s1
        TAUS2 = 10*TAUS0/(3+(5/(1+TT))+(2/(1+4*TT)))
        TCS1  = 1/((1/TAUM)+(1/TAUS1)) #TAU prime c1
        TCS2  = 1/((1/TAUM)+(1/TAUS2))
        TCR1  = 1/((1/TCS1)+(1/TAUR)) # TAU c1
        TCR2  = 1/((1/TCS2)+(1/TAUR))
        JTOT1 = TCR1/(1+numpy.power((freq1*TCR1),2))
        JTOT2 = TCR2/(1+numpy.power((freq2*TCR2),2))
        RR1   = CMR*((3*JTOT1)+(7*JTOT2))+(CMS*TCS2)/(1+numpy.power(freq2*TCS2,2))
        T1M = 1/RR1 # T1m
        R1 = PROPR*(((CONC/55.55)*SOLV)/(T1M+TAUM));  #PROPR    # Y de R1
        # return x
        return PROPR*(((CONC/55.55)*SOLV)/(T1M+TAUM))
   
    data_yerr = 0.000001
    least_squares = LeastSquares(rawdata_x, rawdata_y, data_yerr, line)
    # pass starting values for a and b

    m = Minuit(least_squares,
        CONC=params["CONC"]["value"],
        SOLV=params["SOLV"]["value"],
        PROPR=params["PROPR"]["value"],
        gl=params["gl"]["value"],
        SPIN=params["SPIN"]["value"],
        TAUV=params["TAUV"]["value"],
        TAUS0=params["TAUS0"]["value"],
        TAUM=params["TAUM"]["value"],
        TAUR=params["TAUR"]["value"],
        dw=params["dw"]["value"],
        COUPL=params["COUPL"]["value"],
        distrot=params["distrot"]["value"],
        limit_CONC=(1E-4, 1E-2),
        limit_SOLV=(1.0, 8.0),
        limit_PROPR=(0.1,1.0E2),
        limit_gl=(0.1,3),
        limit_SPIN=(0.5,4.5),
        limit_TAUV=(1E-12,1e-8),
        limit_TAUS0=(1E-11,1E-8),
        limit_TAUM=(1E-10,1E-6),
        limit_TAUR=(1E-12,1E-8),
        limit_dw=(0,100000),
        limit_COUPL=(1E6,1E8),
        limit_distrot=(1.5E-8,4.5E-8),
        fix_CONC = True,
        fix_SOLV = True,
        fix_PROPR = True,
        fix_gl = True,
        fix_SPIN = True,
        fix_TAUV = False,
        fix_TAUS0 = False,
        fix_TAUM = False,
        fix_TAUR = False,
        fix_dw = True,
        fix_COUPL = True,
        fix_distrot = False,
    ) 

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
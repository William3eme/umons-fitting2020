import sys
import json
import codecs
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
    with codecs.open("./files/{}.json".format(uid), "r" , "utf-8") as f:
    # with codecs.open("./files/{}.json".format(uid), "r" , "utf-8") as f:
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
        limit_CONC=(float(params["CONC"]["minM"]),float(params["CONC"]["maxM"])),
        limit_SOLV=(float(params["SOLV"]["minM"]),float(params["SOLV"]["maxM"])),
        limit_PROPR=(float(params["PROPR"]["minM"]),float(params["PROPR"]["maxM"])),
        limit_gl=(float(params["gl"]["minM"]),float(params["gl"]["maxM"])),
        limit_SPIN=(float(params["SPIN"]["minM"]),float(params["SPIN"]["maxM"])),
        limit_TAUV=(float(params["TAUV"]["minM"]),float(params["TAUV"]["maxM"])),
        limit_TAUS0=(float(params["TAUS0"]["minM"]),float(params["TAUS0"]["maxM"])),
        limit_TAUM=(float(params["TAUM"]["minM"]),float(params["TAUM"]["maxM"])),
        limit_TAUR=(float(params["TAUR"]["minM"]),float(params["TAUR"]["maxM"])),
        # limit_dw=(float(params["dw"]["minM"]),float(params["dw"]["maxM"])),
        limit_COUPL=(float(params["COUPL"]["minM"]),float(params["COUPL"]["maxM"])),
        limit_distrot=(float(params["distrot"]["minM"]),float(params["distrot"]["maxM"])),
        fix_CONC = params["CONC"]["fixed"],
        fix_SOLV = params["SOLV"]["fixed"],
        fix_PROPR = params["PROPR"]["fixed"],
        fix_gl = params["gl"]["fixed"],
        fix_SPIN = params["SPIN"]["fixed"],
        fix_TAUV = params["TAUV"]["fixed"],
        fix_TAUS0 = params["TAUS0"]["fixed"],
        fix_TAUM = params["TAUM"]["fixed"],
        fix_TAUR = params["TAUR"]["fixed"],
        # fix_dw = params["dw"]["fixed"],
        fix_COUPL = params["COUPL"]["fixed"],
        fix_distrot = params["distrot"]["fixed"],
    ) 

    m.migrad() # finds minimum of least_squares function
    m.hesse()  # computes errors 

    res = m.values.values()
    for i,element in enumerate(params):
        params[element]["value"] = res[i]


    with codecs.open("./files/{}.json".format(uid), 'w',"utf-8") as f:
    # with codecs.open("./files/{}.json".format(uid), 'w',"utf-8") as f:
        f.write(json.dumps(fit,ensure_ascii=False))
    print("OK")
    # sys.exit(42)

# os.close(1)
except:
    print("PAS OK")
    # os.close(0)
    # exit(0)
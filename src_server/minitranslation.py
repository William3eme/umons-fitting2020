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


    def line(x,CONC,SPIN,B,DIF,TAUS0,TAUV,PROPT,gl): 
        VMHFL = 1
        freq1 = x * 2E6 * numpy.pi
        freq2 = freq1 * 656 #tester 658
        CMT = numpy.power(gl,2)*0.91783E-11*numpy.power(VMHFL,2)*PROPT*CONC*SPIN*(SPIN+1)/(B*DIF)
        TCD = numpy.power(B,2)/DIF
        TAUS1 = 5*TAUS0/((4/(1+4*numpy.power(freq2*TAUV,2)))+(1/(1+numpy.power(freq2*TAUV,2))))      #Tau s1
        TAUS2 = 10*TAUS0/(3+(5/(1+numpy.power(freq2*TAUV,2)))+(2/(1+4*numpy.power(freq2*TAUV,2))))   #Tau s2

        TETA = numpy.arctan(freq1*TAUS1)
        RHO  = TCD*numpy.sqrt(numpy.power(freq1,2)+1/numpy.power(TAUS1,2))
        CO1  = numpy.cos(TETA/2)
        CO2  = numpy.cos(TETA)
        CO3  = numpy.cos(TETA*3/2)
        SI1  = numpy.sin(TETA/2)
        SI2  = numpy.sin(TETA)
        SI3  = numpy.sin(TETA*3/2)
        NUM  = 1+RHO/4+numpy.sqrt(RHO)*5/4*CO1+4/9*RHO*CO2+numpy.power(RHO,(3/2))*CO3/9+numpy.power(RHO,(3/2))*CO1/9+CO2/36*RHO*RHO
        DEN1 = 1+numpy.sqrt(RHO)*CO1+4/9*RHO*CO2+numpy.power(RHO,(3/2))/9*CO3
        DEN2 = numpy.sqrt(RHO)*SI1+4/9*RHO*SI2+SI3/9*numpy.power(RHO,(3/2))
        DESPE1 = NUM/(numpy.power(DEN1,2)+numpy.power(DEN2,2))  #J(wi)
    
        TETA = numpy.arctan(freq2*TAUS1)
        RHO  = TCD*numpy.sqrt(numpy.power(freq2,2)+1/numpy.power(TAUS1,2))
        CO1  = numpy.cos(TETA/2)
        CO2  = numpy.cos(TETA)
        CO3  = numpy.cos(TETA*3/2)
        SI1  = numpy.sin(TETA/2)
        SI2  = numpy.sin(TETA)
        SI3  = numpy.sin(TETA*3/2)
        NUM  = 1+RHO/4+numpy.sqrt(RHO)*5/4*CO1+4/9*RHO*CO2+numpy.power(RHO,(3/2))*CO3/9+numpy.power(RHO,(3/2))*CO1/9+CO2/36*RHO*RHO
        DEN1 = 1+numpy.sqrt(RHO)*CO1+4/9*RHO*CO2+numpy.power(RHO,(3/2))/9*CO3
        DEN2 = numpy.sqrt(RHO)*SI1+4/9*RHO*SI2+SI3/9*numpy.power(RHO,(3/2))
        DESPE2 = NUM/(numpy.power(DEN1,2)+numpy.power(DEN2,2))  #J(ws)

        R1 = CMT*(3*DESPE1+7*DESPE2)                # Y de R1
        #R2 = CMT*(6.5*DESPE2+1.5*DESPE1+2.*JJ0)     # Y de R2
        # console.log('DESPE1:',DESPE1,'DESPE2:',DESPE2,'R1:',R1,'CMT:',CMT)
        return CMT*(3*DESPE1+7*DESPE2)

    data_yerr = 0.000001
    least_squares = LeastSquares(rawdata_x, rawdata_y, data_yerr, line)
    # pass starting values for a and b

    m = Minuit(least_squares,
        CONC=params["CONC"]["value"],
        SPIN=params["SPIN"]["value"],
        B=params["B"]["value"],
        DIF=params["DIF"]["value"],
        TAUS0=params["TAUS0"]["value"],
        TAUV=params["TAUV"]["value"],
        PROPT=params["PROPT"]["value"],
        gl=params["gl"]["value"],
        limit_CONC=(1E-4, 1E-2),
        limit_SPIN=(0.5,4.5),
        limit_B=(1.5E-8,4.5E-8),
        limit_DIF=(4.0E-6,5.0E-5),
        limit_TAUS0=(1E-11,1E-8),
        limit_TAUV=(1E-12,1E-8),
        limit_PROPT=(0.1,1E2),
        limit_gl=(0.01,3),
        fix_CONC = True,
        fix_SPIN = True,
        fix_B = False,
        fix_DIF = False,
        fix_TAUS0 = False,
        fix_TAUV = True,
        fix_PROPT = True,
        fix_gl = True,
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
# print("hello")
import sys
import json
import os
import codecs
import math

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
    
    # print(fit)

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
    # for i,e in enumerate(rawdata_y):
    #     print("{}= {} <br>".format(i,(e/concentration)-offset))


    params = fit["model"]["params"]

    def line(x,MSAT,Radius,Dif,TauNeel,P,Temp):
        freq1 = x * 2E6 * numpy.pi 
        freq2 = freq1 * 656 #tester 658
        PROPT = 1
        MASPAR = 4*numpy.arctan(1)*4*numpy.power(Radius,3)*5.18/3
        MSATU = MSAT*MASPAR
        MSATU2 = MSATU*1E-3
        CONCPAR = 232.*1E-3/(3.*MASPAR)
        CMT = 177650.*CONCPAR*numpy.power(1,2)*PROPT*numpy.power(MSATU,2)/(Radius*Dif)
        TCD = numpy.power(Radius,2)/Dif
        TauS1 = TauNeel

        TETA = numpy.arctan(freq1*TauS1)
        RHO = TCD*numpy.sqrt(numpy.power(freq1,2)+1./numpy.power(TauS1,2))
        CO1 = numpy.cos(TETA/2)
        CO2 = numpy.cos(TETA)
        CO3 = numpy.cos(TETA*3/2)
        SI1 = numpy.sin(TETA/2)
        SI2 = numpy.sin(TETA)
        SI3 = numpy.sin(TETA*3/2)
        NUM = 1.+RHO/4.+numpy.sqrt(RHO)*5/4*CO1+4/9*RHO*CO2+numpy.power(RHO,(3/2))*CO3/9+numpy.power(RHO,(3/2))*CO1/9+CO2/36*RHO*RHO
        DEN1 = 1.+numpy.sqrt(RHO)*CO1+4/9*RHO*CO2+numpy.power(RHO,(3/2))/9*CO3
        DEN2 = numpy.sqrt(RHO)*SI1+4/9*RHO*SI2+SI3/9*numpy.power(RHO,(3/2))
        DESPE1 = NUM/(numpy.power(DEN1,2)+numpy.power(DEN2,2))

        TETA = numpy.arctan(freq2*TauS1)
        RHO = TCD*numpy.sqrt(numpy.power(freq2,2)+1./numpy.power(TauS1,2))
        CO1 = numpy.cos(TETA/2)
        CO2 = numpy.cos(TETA)
        CO3 = numpy.cos(TETA*3/2)
        SI1 = numpy.sin(TETA/2)
        SI2 = numpy.sin(TETA)
        SI3 = numpy.sin(TETA*3/2)
        NUM = 1+RHO/4+numpy.sqrt(RHO)*5/4*CO1+4/9*RHO*CO2+numpy.power(RHO,(3/2))*CO3/9+numpy.power(RHO,(3/2))*CO1/9+CO2/36*RHO*RHO
        DEN1 = 1+numpy.sqrt(RHO)*CO1+4/9*RHO*CO2+numpy.power(RHO,(3/2))/9*CO3
        DEN2 = numpy.sqrt(RHO)*SI1+4/9*RHO*SI2+SI3/9*numpy.power(RHO,(3/2))
        DESPE2 = NUM/(numpy.power(DEN1,2)+numpy.power(DEN2,2))

        R1TRANF = CMT*3.*DESPE1
        R2TRANF = CMT*3.*DESPE2

        zed = numpy.sqrt(2*TCD*freq1)
        JSUP = 1+((5*zed)/8)+(numpy.power(zed,2)/8)
        JINF = 1+zed+(numpy.power(zed,2)/2)+(numpy.power(zed,3)/6)+(4*numpy.power(zed,4)/81)+(numpy.power(zed,5)/81)+(numpy.power(zed,6)/648)
        JTOT = JSUP/JINF

        R1TRANB = CMT*(3*JTOT)

        HTESLA = x*4.7/200.
        EXPLA = (HTESLA*MSATU2)/(1.380662E-23*Temp)
        LANG = 1 / EXPLA
        LANG2 = []
        # print("coucou1{} {}".format(EXPLA,LANG))
        for i,value in enumerate(EXPLA):
            if(value <= 80.0):
                if(value <0.003):
                    LANG[i]=0
                else:
                    EXPP = numpy.exp(value)
                    EXPM = math.exp(-value)
                    LANA = (EXPP+EXPM)/(EXPP-EXPM)
                    LANG[i] = (LANA-1/value)/value
        # if(EXPLA <= 80):
        #     print("coucou2")   
        #     if(EXPLA<0.003):
        #         LANG = 0
        #         print("coucou3")   
            
        #     else:
        #         EXPP = numpy.exp(EXPLA)
        #         EXPM = numpy.exp(-EXPLA)
        #         LANA = (EXPP+EXPM)/(EXPP-EXPM)
        #         LANG = (LANA-1/EXPLA)/EXPLA
        #         print("coucou4")
            LANG2.append(math.pow(LANG[i],2)*math.pow(value,2))
            if(value <0.03):
                LANG[i] = 1/3
            if(value > 90 ):
                LANG[i] = 0
        LANG2 = numpy.array(LANG2)
            
            
        # print("coucou5")   
            
        
        # LANG2  = numpy.power(LANG,2)*numpy.power(EXPLA,2)

        # if EXPLA<0.03:
        #     LANG = 1/3
        
        # if EXPLA>90:
        #     LANG = 0

        return 7*P*LANG*R2TRANF+ (7*(1-P)*LANG+3*(1-LANG2-2*LANG))*R1TRANF+ 3*LANG2*R1TRANB
        # return test
         


        

    data_yerr = 0.00000001
    least_squares = LeastSquares(rawdata_x, rawdata_y, data_yerr, line)
    # # pass starting values for a and b
    m = Minuit(least_squares,
    MSAT=float(params["MSAT"]["value"]),
    Radius=float(params["Radius"]["value"]),
    Dif=float(params["Dif"]["value"]),
    TauNeel=float(params["TauNeel"]["value"]),
    P=float(params["P"]["value"]),
    Temp=float(params["Temp"]["value"]),
    limit_MSAT=(float(params["MSAT"]["minM"]),float(params["MSAT"]["maxM"])),
    limit_Radius=(float(params["Radius"]["minM"]),float(params["Radius"]["maxM"])),
    limit_Dif=(float(params["Dif"]["minM"]),float(params["Dif"]["maxM"])),
    limit_TauNeel=(float(params["TauNeel"]["minM"]),float(params["TauNeel"]["maxM"])),
    limit_P=(float(params["P"]["minM"]),float(params["P"]["maxM"])),
    limit_Temp=(float(params["Temp"]["minM"]),float(params["Temp"]["maxM"])),
    fix_MSAT=params["MSAT"]["fixed"],
    fix_Radius=params["Radius"]["fixed"],
    fix_Dif=params["Dif"]["fixed"],
    fix_TauNeel=params["TauNeel"]["fixed"],
    fix_P=params["P"]["fixed"],
    fix_Temp=params["Temp"]["fixed"],
    ) 

    m.migrad() # finds minimum of least_squares function
    m.hesse()  # computes errors 
    # m.minos()

    # print (m.params)

    res = m.values.values()
    for i,element in enumerate(params):
        params[element]["value"] = res[i]




    with codecs.open("./files/{}.json".format(uid), 'w',"utf-8") as f:
    # with codecs.open("./files/{}.json".format(uid), 'w',"utf-8") as f:
        f.write(json.dumps(fit,ensure_ascii=False))
    print("OK")
    # print(fit)
    # # sys.exit(42)

# os.close(1)
except:
    print("PAS OK")
    # print(fit)
    # os.close(0)
    # exit(0)


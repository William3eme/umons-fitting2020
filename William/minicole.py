import sys
import json
import probfit
import  numpy
from matplotlib import pyplot as plt
import numpy as  numpy
from iminuit import Minuit
from iminuit.cost import LeastSquares

# try:


# lecture du fichier fit
uid = sys.argv [1]
fit = {}
with open("../files/{}.json".format(uid), 'r') as f:
    fit = json.loads(f.read())

# Je récupère mes données brutes (rawdata)
rawdata = list(fit["rawdata"]["data"])
rawdata_x=[]
rawdata_y=[]
for element in rawdata:
    rawdata_x.append(element["x"])
    rawdata_y.append(element["y"])

rawdata_x =  numpy.array(rawdata_x)
rawdata_y =  numpy.array(rawdata_y)

plt.plot(rawdata_x,rawdata_y)

# je récupère les valeur params
params = fit["model"]["params"]

# je récupère les limites
# je récupère si fix ou pas

print("avant:")
for element in params:
    print(params[element]["value"]) 

COLED=2
COLEA=6
COLEFC=10000000
COLEB=2
# for element in rawdata :
def line(x,COLED,COLEA,COLEFC,COLEB): 

    Q1 = x*1000000/COLEFC
    Q2 =  numpy.cos(3.1416*COLEB/4)
    R1 = COLED+(COLEA*(1+ numpy.power(Q1,(COLEB/2))*Q2))/(1+(2* numpy.power(Q1,(COLEB/2))*Q2)+ numpy.power(Q1,COLEB));  # Y de R1
    return COLED+(COLEA*(1+ numpy.power(Q1,(COLEB/2))*Q2))/(1+(2* numpy.power(Q1,(COLEB/2))*Q2)+ numpy.power(Q1,COLEB))
    
# print (line(x,COLED,COLEA,COLEFC,COLEB))   
    # return R1
# print(line(100,2,6,1e7,2))

data_yerr = 0.1
least_squares = LeastSquares(rawdata_x, rawdata_y, data_yerr, line)
# # pass starting values for a and b
m = Minuit(least_squares,COLED=params["COLED"]["value"],COLEA=params["COLEA"]["value"],COLEFC=params["COLEFC"]["value"],COLEB=params["COLEB"]["value"], limit_COLED=(0.1, 9E1),limit_COLEA=(0.1, 6E1),limit_COLEFC=(1**3,2E8),limit_COLEB=(0.1,3)) 

m.migrad() # finds minimum of least_squares function
m.hesse()  # computes errors 

# draw data and fitted line
# plt.errorbar(rawdata_x, rawdata_y, data_yerr, fmt="o")
# plt.plot(rawdata_x, line(rawdata_x, *m.values.values()))

# # print parameter values and uncertainty estimates
# for p in m.parameters:
#     print("{} = {:.3f} +/- {:.3f}".format(p, m.values[p], m.errors[p]))

# plt.show()  
# def ExModelWiwi():
#     print("taper les autres model ici")

# print(type(m.values.values()))
res = m.values.values()
for i,element in enumerate(params):
    params[element]["value"] = res[i]


print("apres:")
for element in params:
    print(params[element]["value"]) 

with open("../files/{}.json".format(uid), 'w') as f:
    f.write(json.dumps(fit))



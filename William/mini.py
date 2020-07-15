import sys
import json
from matplotlib import pyplot as plt
import numpy as np
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

rawdata_x = np.array(rawdata_x)
rawdata_y = np.array(rawdata_y)

plt.plot(rawdata_x,rawdata_y)
  


def line(x,a,b,c):
    # print ("x: {}".format(x))
    return a*(x**2)+b*x+c


data_yerr = 0.1
least_squares = LeastSquares(rawdata_x, rawdata_y, data_yerr, line)
# pass starting values for a and b
m = Minuit(least_squares, a=0,b=0,c=0, limit_a=(0, 100), limit_b=(0, 100), limit_c=(0,100),fix_a=False,fix_b=True,fix_c=False) # true = fix
m.migrad() # finds minimum of least_squares function
m.hesse()  # computes errors 

# draw data and fitted line
# plt.errorbar(rawdata_x, rawdata_y, data_yerr, fmt="o")
# plt.plot(rawdata_x, line(rawdata_x, *m.values.values()))

# print parameter values and uncertainty estimates
# for p in m.parameters:
#     print("{} = {:.3f} +/- {:.3f}".format(p, m.values[p], m.errors[p]))

# plt.show()  
# def ExModelWiwi():
#     print("taper les autres model ici")









# # draw toy data
# plt.errorbar(data_x, data_y, data_yerr, fmt="o")
# plt.xlim(-0.1, 1.1)
# # plt.plot(data_x,data_y)

# least_squares = LeastSquares(data_x, data_y, data_yerr, line)
# m = Minuit(least_squares, a=0, b=0, c=0)

# m.migrad() # finds minimum of least_squares function
# m.hesse()  # computes errors

# # draw data and fitted line
# plt.errorbar(data_x, data_y, data_yerr, fmt="o")
# plt.plot(data_x, line(data_x, *m.values.values()))


# # print parameter values and uncertainty estimates
# for p in m.parameters:
#     print("{} = {:.3f} +/- {:.3f}".format(p, m.values[p], m.errors[p]))

# plt.show()
# # print(data_x,data_y)

# import matplotlib.pyplot as plt
# plt.plot([1, 2, 3, 4])
# plt.ylabel('some numbers')
# plt.show()
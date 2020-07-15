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



# plt.plot(rawdata_x,rawdata_y)
# plt.show()    


def line(x,p,m):
    return m*x+p


def ExModelWiwi():
    print("taper les autres model ici")

    # for element in datastore:
    #     print(element[""])
    

    
# datastore=""
# if filename:
#     with open(filename, 'r') as f:
#         datastore =json.load "../files/{}.json" (sys.argv [2])
# print datastore

# # our line model
# def line(x, a, b, c):
#     return a + x * b + c * (x ** 2)

# # generate random toy data with random offsets in y
# np.random.seed(1)
# data_x = np.linspace(0, 1, 10)
# data_yerr = 0.1 # could also be an array
# data_y = line(data_x, 1, 2, 0.2) + data_yerr * np.random.randn(len(data_x))

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
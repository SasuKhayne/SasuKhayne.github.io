# -*- coding: utf-8 -*-
"""
Created on Wed Jan 19 10:27:29 2022

@author: brice
"""

import pandas as pd
import math
import os 

#os.chdir("./Downloads/csgo_data")

#data = pd.read_csv('./mm_master_demos.csv') #
#maps = pd.read_csv('./map_data.csv')
df = pd.read_csv('./data2.csv')

df = df.drop(['Unnamed: 0', 'id', 'arm_dmg', 'hitbox', 'wp_type', 'att_rank', 'vic_rank'], axis=1)
df3 = df[:1]

print(df.columns)

pool = ['de_dust2',
 'de_cache',
 'de_inferno',
 'de_mirage',
 'de_cbble',
 'de_overpass',
 'de_train']

maps = [0 for i in range(7)]

for row in df.index :
    map = pool.index(df['map'][row])
    if maps[map]<20000 :
        df3 = pd.concat([df3,df.iloc[[row]]])
        maps[map] += 1
    if sum(maps)>=20000*7:
        break
df3.to_csv('data3.csv')




# df = data[data['map']=='de_dust2']
# for i in range(1,len(pool)) :
#     df = pd.concat([df,data[data['map']==pool[i]]])

# for row in df.index :
    
#     sx = -maps['StartX'][maps['name']==df['map'][row]]
#     ex = maps['EndX'][maps['name']==df['map'][row]]
#     sy = -maps['StartY'][maps['name']==df['map'][row]]
#     ey = maps['EndY'][maps['name']==df['map'][row]]
    
    
#     df['vic_pos_x'][row] = math.floor((df['vic_pos_x'][row]+sx)/(sx+ex)*1024)
#     df['vic_pos_y'][row] = math.floor((1024-(df['vic_pos_y'][row]+sy)/(sy+ey)*1024))
#     df['att_pos_x'][row] = math.floor((df['att_pos_x'][row]+sx)/(sx+ex)*1024)
#     df['att_pos_y'][row] = math.floor((1024-(df['att_pos_y'][row]+sy)/(sy+ey)*1024))

# df.to_csv('data2.csv')



from flask import Flask, jsonify, render_template
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
import pandas as pd

engine = create_engine('postgresql+psycopg2://postgres:new_password@localhost:5433/weather_data')
Base = automap_base()
Base.prepare(engine, reflect=True)

Cities = Base.classes.cities

session = Session(engine)


app = Flask(__name__)

@app.route('/')
def home():
      return render_template("Index.html")

@app.route('/cities')
def cities():
#    
     response = session.query(
           Cities.id,
           Cities.city_id,
           Cities.date,
           Cities.country,
           Cities.city,
           Cities.cloudiness,
           Cities.humidity,
           Cities.maximum_temperature,
           Cities.maximum_temperature_f,
           Cities.wind_speed_kmh,
           Cities.lat,
           Cities.lng
           ).all()
#      for row in response:
            # print(row)
     df =  pd.DataFrame(response).to_dict("records")
#      print(df)
     return jsonify(df)

@app.route('/cities/north')
def cities_north():
#    
     response = session.query(
           Cities.id,
           Cities.city_id,
           Cities.date,
           Cities.country,
           Cities.city,
           Cities.cloudiness,
           Cities.humidity,
           Cities.maximum_temperature,
           Cities.maximum_temperature_f,
           Cities.wind_speed_kmh,
           Cities.lat,
           Cities.lng
           ).filter(Cities.lat>0).all()
#      for row in response:
            # print(row)
     df =  pd.DataFrame(response).to_dict("records")
#      print(df)
     return jsonify(df)

@app.route('/cities/south')
def cities_south():
#    
     response = session.query(
           Cities.id,
           Cities.city_id,
           Cities.date,
           Cities.country,
           Cities.city,
           Cities.cloudiness,
           Cities.humidity,
           Cities.maximum_temperature,
           Cities.maximum_temperature_f,
           Cities.wind_speed_kmh,
           Cities.lat,
           Cities.lng
           ).filter(Cities.lat<0).all()
#      for row in response:
            # print(row)
     df =  pd.DataFrame(response).to_dict("records")
#      print(df)
     return jsonify(df)

# to do create northern cities and southern cities row

if __name__ == "__main__":
    app.run(debug=True)


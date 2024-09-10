"""
USAGE: python3 scripts/get-courses.py [-n max_new_courses] [-l language]

This script fetches the list of courses from the FIB API and stores them in the MongoDB database.
Don't set a very high value for max_new_courses, as the FIB API will reject new requests for the course details.
"""

import requests as r
import pandas as pd
import json
import logging
import sys
import getopt

from pymongo import MongoClient
from pymongo import UpdateOne

logging.basicConfig(level=logging.INFO, force=True)

try:
    with open('.env-python.local') as f:
        env_vars = json.load(f)
        CLIENT_ID = env_vars["CLIENT_ID"]
        MONGO_URL = env_vars["MONGO_URL"]
except FileNotFoundError:
    logging.error("Please create a .env-python.local file with the CLIENT_ID and MONGO_URL variables")
    sys.exit(2)

URL_API = "https://api.fib.upc.edu/v2"

client = MongoClient(MONGO_URL)
mongo_db = client["fib-review"]

try:
    opts, args = getopt.getopt(sys.argv[1:], "n:l:")
except getopt.GetoptError:
    logging.error("Invalid arguments")
    sys.exit(2)

LANGUAGE = "en"
MAX_NEW_COURSES = 50
for opt, arg in opts:
    if opt == "-n":
        MAX_NEW_COURSES = int(arg)
    elif opt == "-l":
        LANGUAGE = arg

def make_request(endpoint):
    params = {"client_id": CLIENT_ID, "format": "json"}
    headers = {"Accept-Language": LANGUAGE}
    return r.get(f"{URL_API}/{endpoint}", params=params, headers=headers)

page_num = 1
courses_json = []
next_available = True

while next_available:
    logging.info(f"Fetching page {page_num} of assignatures/")
    response = make_request(f'assignatures/?page={page_num}')

    if response.ok:
        try:
            response_json = json.loads(response.text)
            if 'results' not in response_json.keys():
                logging.error(f"results not in JSON object")
                raise RuntimeError(f"results not in JSON object")
            if 'next' not in response_json.keys() or response_json['next'] is None:
                next_available = False                
            courses_json += response_json['results']
        except Exception as e:
            logging.error(f"Error while parsing JSON object of assignatures/?page={page_num}: {e}")
            raise RuntimeError(f"Error while parsing JSON object of assignatures/?page={page_num}: {e}")
    else:
        logging.error(f"API call to assignatures/?page={page_num} failed: <{response.status_code}>: {response.text}")
        raise RuntimeError(f"API call to assignatures/?page={page_num} failed: <{response.status_code}>: {response.text}")
    
    page_num += 1

df = pd.DataFrame(courses_json)
df = df[['id', 'nom', 'credits', 'vigent']]
df = df[df['vigent'] == 'S']
df = df.drop(columns=['vigent'])
df = df.rename(columns={'id': '_id', 'nom': 'name', 'credits': 'creditHours'})

# Filter by courses not present in the database
courses_in_db = list(mongo_db.courses.find({"_id": {"$in": list(df["_id"])}}, {"_id": 1}))
courses_in_db = [course["_id"] for course in courses_in_db]
df = df[~df["_id"].isin(courses_in_db)]
df = df.head(MAX_NEW_COURSES)

logging.info(f"Fetched {len(df)} new courses")
df.head()

def get_description(id):
    response = make_request(f'assignatures/{id}/guia')

    if response.ok:
        try:
            response_json = json.loads(response.text)
            if 'descripcio' not in response_json.keys():
                raise RuntimeError(f"descripcio not in JSON object")
            return response_json['descripcio']
        except Exception as e:
            logging.warning(f"Error while parsing JSON object of assignatures/{id}/guia/: {e}")
            return None
    else:
        logging.warning(f"API call to assignatures/{id}/guia/ failed: <{response.status_code}>: {response.text}")
        return None
    
def make_subject_url(id):
    if LANGUAGE == "en":
        return f"https://www.fib.upc.edu/en/studies/bachelors-degrees/bachelor-degree-informatics-engineering/curriculum/syllabus/{id}"
    elif LANGUAGE == "ca":
        return f"https://www.fib.upc.edu/ca/estudis/graus/grau-en-enginyeria-informatica/pla-destudis/assignatures/{id}"
    else:
        return f"https://www.fib.upc.edu/es/estudios/grados/grado-en-ingenieria-informatica/plan-de-estudios/asignaturas/{id}"
    
df['description'] = df['_id'].apply(get_description)
df = df[df['description'].notnull()]

df['url'] = df['_id'].apply(make_subject_url)

df_json = df.to_dict("records")
operations = [
    UpdateOne({'_id': course['_id']}, {'$set': course}, upsert=True)
    for course in df_json
]
result = mongo_db.courses.bulk_write(operations, ordered=False)
logging.info("Wrote {} new courses, updated {} courses".format(result.upserted_count, result.matched_count))

client.close()

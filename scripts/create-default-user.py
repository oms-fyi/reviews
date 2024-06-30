import getpass
from pymongo import MongoClient

### Requirements ###
# python3 -m pip install "pymongo[srv]"

MONGO_SERVER = 'localhost:27017'


def get_database():
    print('Enter login credentials: ')
    user = input('Username: ')
    try:
        password = getpass.getpass('Password: ')
    except Exception as error:
        print('Error occurred: ', error)

    CONNECTION_STRING = f"mongodb://{user}:{password}@{MONGO_SERVER}/admin?retryWrites=true&w=majority"

    print('Connecting to the database...')

    client = MongoClient(CONNECTION_STRING)

    return client

def create_default_user(clientDB):
    try:
        clientDB.fibreview.command('dropUser', 'fibreview')
    except:
        pass

    print('Creating default user [fibreview]...')
    password = getpass.getpass('Password: ')
    clientDB.fibreview.command('createUser', 'fibreview', pwd=password, roles=['readWrite'])

if __name__ == '__main__':
    clientDB = get_database()
    try:
        clientDB.fibreview.create_collection('dummy')
    except:
        pass

    clientDB.fibreview.dummy.insert_one({'dummy': 'dummy'})

    create_default_user(clientDB)




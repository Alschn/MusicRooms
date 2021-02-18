# MusicRooms
Music Rooms web application built with Django Rest Framework, React, Redux, Spotify Web API.  

#### Used frameworks & libraries
##### Backend:
- Django
- django-rest-framework
- django-rest-auth
- django-all-auth
##### Frontend:
- React
- Redux
- Material UI
- axios

## Installation (dev)
git clone https://github.com/Alschn/MusicRooms.git    

### Django Setup
    py -3 -m venv venv  

    venv\Scripts\activate  

    pip install -r requirements.txt  

    python manage.py makemigrations  

    python manage.py migrate  

    python manage.py createsuperuser  

    python manage.py runserver  

### React Setup
    cd frontend
    
    npm i
    
    npm run build
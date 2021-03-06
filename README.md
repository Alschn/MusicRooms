<div align="center" style="padding-bottom: 10px">
    <h1>Music Rooms</h1>
    <img alt="Python" src="https://img.shields.io/badge/python%20-%2314354C.svg?&style=for-the-badge&logo=python&logoColor=white"/>
    <img alt="Django" src="https://img.shields.io/badge/django%20-%23092E20.svg?&style=for-the-badge&logo=django&logoColor=white"/>
    <img alt="JavaScript" src="https://img.shields.io/badge/javascript%20-%23323330.svg?&style=for-the-badge&logo=javascript&logoColor=%23F7DF1E"/>
    <img alt="React" src="https://img.shields.io/badge/react%20-%2320232a.svg?&style=for-the-badge&logo=react&logoColor=%2361DAFB"/>
    <img alt="Spotify" src="https://img.shields.io/badge/Spotify-1ED760?style=for-the-badge&logo=spotify&logoColor=white" />
<p>
Music Rooms web application built with Django Rest Framework, Django Channels, Websockets API, React, Redux, Spotify Web API.  
</p>
</div>


#### Used frameworks & libraries
##### Backend:
- Django
- django-rest-framework
- Django Channels
- django-rest-auth
- django-all-auth
##### Frontend:
- React
- Redux
- Material UI
- Websocket API
- axios
##### External APIs
- Spotify Web API
- Spotify Web Playback SDK

https://developer.spotify.com/documentation/web-api/
https://developer.spotify.com/documentation/web-playback-sdk/


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
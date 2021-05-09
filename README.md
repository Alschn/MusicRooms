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

## Motivation behind this project and features:
This project was inspired by [TechWithTim's Music Controller](https://youtu.be/JD-age0BPVo). 
Initially I was following the tutorial to learn Django Rest Framework paired with React but it quickly came to an end and I was not satisfied with the end results. 
Tim's application turned out to be flawed and missing features I hoped for. His app was designed to be run in local network and it was not supposed to be playing music, which seemed pointless to me.  

My goal was to create a Web Player, whose state would be synchronized among all listeners. 
I used Spotify Web Playback SDK (so that music would actually be heard inside the browser) and websockets (Django Channels + Websocket API) to implement synchronization and add chat to rooms. 
I also added social auth using Spotify Accounts - token based authentication between backend and frontend using django-all-auth and Redux. 
I rewrote most of the class components into functional components in order to make use of hooks. 
I wrote unit tests to test api endpoints and set up tests pipelines using Github Workflows 
(I am planning to add more api tests, tests related to websocket communication and frontend tests).  

I'd love to use this application with my friends one day.


## Used frameworks, libraries and tools:
#### Backend:
- Django
- django-rest-framework
- Django Channels
- django-rest-auth
- django-all-auth
#### Frontend:
- React
- Redux
- Material UI
- Sass
- Websocket API
- axios
#### External APIs
- Spotify Web API
- Spotify Web Playback SDK

https://developer.spotify.com/documentation/web-api/  
https://developer.spotify.com/documentation/web-playback-sdk/  


## Installation (dev)
git clone https://github.com/Alschn/MusicRooms.git    

### Django Setup
Setup virtual environment (Windows) and install dependencies:
```shell script
py -3 -m venv venv  

venv\Scripts\activate  

pip install -r requirements.txt  
```
Run migrations and create superuser:
```shell script
python manage.py makemigrations  

python manage.py migrate  

python manage.py createsuperuser  
```
Run server:
```shell script
python manage.py runserver
```

### React Setup
Create `.env` file inside the root directory and set following variables:  
```shell script
REACT_APP_REDIRECT_URI='callback uri set in the spotify for developers dashboard'
REACT_APP_REDIRECT_URI_DEV='same as above but with port 3000'
REACT_APP_CLIENT_ID='client id from the dashboard'
REACT_APP_SOCKET_URL='ws://{url}:{port}'
```

Install all dependencies:
```shell script
npm i
```
Build assets which will be loaded by Django:
```shell script
npm run build
```
Local development (frontend runs port 3000, backend 8000):
```shell script
npm start
```
    
## To do:
- Web Player synchronization for every user (started working on that)
- Set up Redis channel layer ?
- Music room and background styling
- Error handling (make ws reconnect, handle backend errors)
- Add api, rooms (async stuff), spotify_api (if it is possible) tests
- Learn how to write frontend tests (Jest, Cypress)
- and way more ...
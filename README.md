# CampinaSetlistManagement

## Introduction
The Setlist Management is a web tool for the CampinaBand that is hosted on https://campinaband.hagenberg.media. It can manage songs, setlists and events and has a simple user management. For all non-members, the next event is displayed on the landing page, together with the corresponding location and date.

Two members of the team are also part of the band and facilitated a closer collaboration that started with the project proposal. Possible features and the scope of the setlist management were brought to the band and feedback was taken into consideration. The first design prototype and the first finished version of the site were tested in user tests with band members.
For the design, we opted for a mobile first approach and close communication between the developers and our UX/UI designers. 
The entire tool was implemented as a single page application. In the frontend we use vue.js with vite as build tool. The backend consists of a Node.js/Express server and a MongoDB database. Communication between the two is managed via redaxios. The project was completed with the deployment on the server and a handover of the repository with included documentation.

## Repository

### Directory Structure
```console
├───client            *Vue Frontend*
│   ├───public
│   └───src
│       ├───assets        *Asset Files*
│       │   └───Icons
│       ├───components        *Vue components used in client side routing*
│       │   └───elements    *Vue components not used in client side routing*
│       ├───models        *DB Models*
│       ├───services        *Service Functions*
│       └───stylesheets        *Stylesheets for different types of elements*
└───server            *node.js backend*
    ├───bin            */www file handles node server Startup*
    ├───public
    │   └───stylesheets
    ├───routes            *REST routes*
    ├───uploads            *Uploaded Files*
    └───views
```

### Branches

#### main 
This is the dev branch. It is set up to work in the standard `fhooe-hypernode-dock` docker container. Simply clone this branch into the `/home/node` directory.

#### fhserver
This is the productive branch it currently runs on the `hagenberg.media` server.

## (FH) Webserver Config

**Root Directory**: /usr/www/users/hgbmedia/campinaband/ \
**Log in**: VERY unsure if i can include this

This section covers all the relevant settings and setup steps that are necessary for the website to run properly.

### Productive Backend
#### app.js
Database URI and name:
```js
const DB_URI = "mongodb://127.0.0.1:27018/";
const DB_NAME = "campina-band-setlist-management";
```
Set cors URLs
```js
app.use(cors({
        origin: ['http://localhost:3000', 'https://campinaband.hagenberg.media', 'http://localhost:3333'],  // domains allowed to request from server
        credentials: true                // allow cookies to be sent
}));
```
#### bin/www
`bin/www` starts up the backend. Per default node listens to port 3000 but this can be changed by setting the PORT environment variable.
```js
var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);
```

#### ecosystem.config.js
The `ecosystem.config.js` is the config file used the start the node backend in `startserver.sh`.
```js
module.exports = {
  apps: [{
      name: 'CampinaBand-SetlistManagement-server',
      script: './bin/www', // call the actual entry point
      interpreter: '/usr/home/hgbmedia/.linuxbrew/bin/node', // force correct node
      env: {
        NODE_ENV: 'production'
      }
    }]};
```

### Productive Frontend
#### .htaccess
The `.htaccess` is in the `CampinaSetlistManagement/client/public` directory since all files there are just copied into the `CampinaSetlistManagement/client/dist` directory on build.

The RewriteRule for `/api` requests ist very important since it enables the communication between frontend and REST backend.
```apacheconf 
  # Proxy API requests to the backend (Node server on localhost:3000)
  RewriteCond %{REQeCond %{UEST_URI} ^/api/
  RewriteRule ^api/(.*)$ http://localhost:3000/$1 [P,L]
```
The RewriteCond has to apply to the baseURL set in `CampinaSetlistManagement/client/src/services/api.ts`
```js
const api = axios.create({
    baseURL: '/api',
    withCredentials: true // automatically sends cookies - needed for authentication
});
```
This rewrite rule is not really in use, it is used to serve files directly if they exist on the Server.
```apacheconf 
  # If the requested file or directory exists, serve it directly
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

```
To make the Single Page Application work all requests need to be rerouted to the index.html, otherwise apache will attempt to look for a file with the requested path.
```apacheconf 
  # Otherwise, rewrite all other requests to index.html
  RewriteRule ^ index.html [L]
```

#### Build
To build the frontend use the following command.
```console
campinaband/client$ npm run build
```
This will run vite and save the build to the `CampinaSetlistManagement/client/dist` directory. For deployment, only that directory is technically required on the server, as it contains the compiled static assets needed to serve the application in production. \
The build process will replace the `CampinaSetlistManagement/client/dist` directory completely. If you need to modify files like the `.htaccess` do it in the `CampinaSetlistManagement/client/public` directory.

### PM2
PM2 manages the startup process. The config file for the pm2 environment is: `/campinaband/CampinaSetlistManagement/server`.
#### Startup
To start the server, run:
```console
campinaband$ sh startserver.sh
```
Note that the `startserver.sh` script is not in the repository as it is server specific.\
The `startserver.sh` script also saves the pm2 proccess which allows it to be restarted automatically in case the server reboots or the node backend crashes. To delete the saved process run:
```console
npx pm2 delete CampinaBand-SetlistManagement-server
```
You can use the following command to check if the process is running. If you deleted the process you will not see the `CampinaBand-SetlistManagement-server` in the output.
```console
npx pm2 list
```
#### Logs
Standard outputs:
```console
npx pm2 logs CampinaBand-SetlistManagement-server --out
```
Error logs:
```console
npx pm2 logs CampinaBand-SetlistManagement-server --err
```
#### Stopping/Restarting the Server
```console
npx pm2 stop CampinaBand-SetlistManagement-server
```
```console
npx pm2 restart CampinaBand-SetlistManagement-server
```
### Apache
The Apache configuration was not done by the original project team. Contact Wolfgang Hochleitner for information.

## Frontend
### Tech Stack
- Framework: Vue 3 + TypeScript
- Bundler: Vite
- Routing: Vue Router
- Styles: Custom CSS
- API: Axios (see `services/api.ts`)

### Routing
Client-Side Routing in this project was realised with Vue-Router. All routes are to be found in `client\src\main.ts`.

### Views (Components and Elements):
All Components are located in `client\src\components` folder.

Elements, which are used as a modular and reusable code pieces are located in `client\src\components\elements` folder.

### Styling
Stylings specific to one component or element are found in the respective components `.vue` file.
All Components-and-Elements Stylesheets are located in `client\src\stylesheets` folder.
Styles with the global styling and the style variables are found in `client\src\style.css`.

### Assets
All Icons and Images that are used in this project are located in `client\src\assets`.

### Connection to Back-End
API calls from the frontend to the backend are handled via Axios, and all logic is centralized in the file `client\src\assets`.
The frontend uses a pre-configured redaxios client (api.ts) to send HTTP requests to the node backend, automatically including cookies for authentication, and receives responses from the backend using standard GET, POST and other methods.

## Backend
This section is a comprehensive overview of the DB Models, Static Functions and REST API Routes used in the project.
### Models
#### Song
##### Properties
| Property     | Type           | Description                                                 |
| ------------ | -------------- | ----------------------------------------------------------- |
| _id          | any (ObjectID) | ID of the song                                              |
| title        | string         | Name of the song                                            |
| artist       | string         | Artist of the song                                          |
| lyrics       | string         | Lyrics of the song with linebreaks and formatting           |
| links        | string[]       | Array of links associated with the song                     |
| files        | SongFile[]     | Array of files associated with the song                     |
| creationDate | string         | Creation date in ISO 8601 Format (YYYY-MM-DDTHH:mm:ss.sssZ) |

#### SongFile
##### Properties
| Property   | Type   | Description                    |
| ---------- | ------ | ------------------------------ |
| instrument | string | Name of the instrument         |
| filePath   | string | Path of the file on the server 

#### Setlist
##### Properties
| Property     | Type           | Description                                                 |
| ------------ | -------------- | ----------------------------------------------------------- |
| _id          | any (ObjectID) | ID of the setlist                                           |
| name         | string         | Name of the setlist                                         |
| songs        | SetlistSong[]  | Array of songs in the setlist                               |
| creationDate | string         | Creation date in ISO 8601 Format (YYYY-MM-DDTHH:mm:ss.sssZ) |

#### SetlistSong
##### Properties
| Property | Type           | Description                   |
| -------- | -------------- | ----------------------------- |
| songId   | any (ObjectID) | ID of the song referenced     |
| position | number         | Position index in the setlist |

#### Event
##### Properties
| Property     | Type               | Description                                                               |
| ------------ | ------------------ | ------------------------------------------------------------------------- |
| _id          | any (ObjectID)     | ID of the event                                                           |
| name         | string             | Name of the event                                                         |
| location     | string             | Location of the event                                                     |
| date         | string             | Date of the event in ISO 8601 Format (YYYY-MM-DDTHH:mm:ss.sssZ)           |
| setlistIds   | any[] (ObjectID[]) | Array containing the IDs of setlists associated with this event           |
| isPublic     | boolean            | Decides if this event can be displayed on the landing page of the website |
| creationDate | string             | Creation date in ISO 8601 Format (YYYY-MM-DDTHH:mm:ss.sssZ)               |
##### Getters
| Getter      | Type   | Description                                                                                  |
| ----------- | ------ | -------------------------------------------------------------------------------------------- |
| getDay      | number | Returns the day of the date the event takes place                                            |
| getMonth    | string | Returns a string representation of the month of the date the event takes place (e.g January) |
| getYear     | number | Returns the year of the date the event takes place                                           |
| getTime     | string | Returns the time of the date the event takes place in the format HH:mm                       |
| getFullDate | string | Returns a human-readble representation of the date the event takes place                     |

#### User
##### Properties
| Property     | Type           | Description                                                   |
| ------------ | -------------- | ------------------------------------------------------------- |
| _id          | any (ObjectID) | ID of the user                                                |
| userName     | string         | Username of the user                                          |
| passwordHash | string         | Hashed password of the user                                   |
| isAdmin      | boolean        | Decides if this user can access the admin page of the website |

#### Static Functions
| Function     | Async | Parameters       | Returns           | Description                                                                  |
| ------------ | ----- | ---------------- | ----------------- | ---------------------------------------------------------------------------- |
| hashPassword | yes   | password: string | Promise\<string\> | Applies a hash function to the input password and returns its hashed version |

### Rest API

| Action | Route                    | Response                               | Description                                                                                                                                 |
| ------ | ------------------------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | /auth                    | authenticated: boolean,<br>user?: User | Gets information of a currently logged in user                                                                                              |
| GET    | /events                  | Event[]                                | Fetches all events                                                                                                                          |
| GET    | /events/upcoming-public  | Event \| null                          | Fetches the next future event that has the isPublic flag set to true                                                                        |
| GET    | /events/:id              | Event \| null                          | Fetches a single event by ID                                                                                                                |
| GET    | /setlists                | Setlist[]                              | Fetches all setlists                                                                                                                        |
| GET    | /setlists/:id            | Setlist \| null                        | Fetches a single setlist by ID                                                                                                              |
| GET    | /songs                   | Song[]                                 | Fetches all songs                                                                                                                           |
| GET    | /songs/:id               | Song \| null                           | Fetches a single song by ID                                                                                                                 |
| GET    | /songs/file/:filename    | File binary content                    | Fetches the raw binary content of a specified file                                                                                          |
| GET    | /users                   | User[]                                 | Fetches all users                                                                                                                           |
| GET    | /users/by-name/:username | User[]                                 | Fetches all users with a specified username, should only return a maximum of one user per name                                              |
| GET    | /genius/lyrics           | url: string                            | Returns the genius page url for song lyrics. Song and artist are passed in as a parameter object<br><br>! Works only on production branch ! |

| Action | Route         | Body                                                      | Description                                                                                                 |
| ------ | ------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| POST   | /events       | Event                                                     | Creatres a new event with the body content in the database                                                  |
| POST   | /login        | username: string,<br>password: string                     | Evaluates login credentials, returns an object containing id, userName and isAdmin on successful validation |
| POST   | /logout       | None                                                      | Destroys the current session and deletes cookies                                                            |
| POST   | /setlists     | Setlist                                                   | Creatres a new setlist with the body content in the database                                                |
| POST   | /songs        | Song                                                      | Creatres a new song with the body content in the database                                                   |
| POST   | /songs/upload | FormData containing information about the files to upload | Uploads files to the server                                                                                 |
| POST   | /users        | User                                                      | Creatres a new user with the body content in the database                                                   |

| Action | Route         | Body    | Description                                                                |
| ------ | ------------- | ------- | -------------------------------------------------------------------------- |
| PUT    | /events/:id   | Event   | Updates the event with the ID :id in the database using the body content   |
| PUT    | /setlists/:id | Setlist | Updates the setlist with the ID :id in the database using the body content |
| PUT    | /songs/:id    | Song    | Updates the song with the ID :id in the database using the body content    |

| Action | Route                 | Description                              |
| ------ | --------------------- | ---------------------------------------- |
| DELETE | /events/:id           | Deletes the event with the ID :id        |
| DELETE | /setlists/:id         | Deletes the setlist with the ID :id      |
| DELETE | /songs/:id            | Deletes the song with the ID :id         |
| DELETE | /songs/file/:filename | Deletes the file with the name :filename |


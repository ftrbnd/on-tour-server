<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a name="readme-top"></a>
<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/ftrbnd/on-tour">
    <img src="https://i.imgur.com/KnLfe3s.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">On Tour Server</h3>

  <p align="center">
    A Fastify server that handles authentication and database requests for the On Tour app
    <br />
    <a href="https://github.com/ftrbnd/on-tour">On Tour</a>
    ·
    <a href="https://github.com/ftrbnd/on-tour-server/issues">Report Bug</a>
    ·
    <a href="https://github.com/ftrbnd/on-tour-server/issues">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#configuration">Configuration</a></li>
      </ul>
    </li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

Main responsibilities:
* Handle authentication requests with Lucia + Spotify OAuth
* Delete expired sessions every 24 hours
* Handle API requests from the On Tour app when users interact with Upcoming Shows or Created Playlists
* Delete a user's data when requested
* Serve the apps' privacy policy page

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

* [![Render][Render]][Render-url]
* [![Fastify][Fastify]][Fastify-url]
* [![Typescript][Typescript]][Typescript-url]
* [![Lucia][Lucia]][Lucia-url]
* [![Zod][Zod]][Zod-url]
* [![Drizzle][Drizzle]][Drizzle-url]
* [![NeonDb][NeonDb]][NeonDb-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/en/) 20 or higher
* Database url from [Neon](https://neon.tech)
* Client id, client secret, and redirect uri from [Spotify](https://developer.spotify.com/documentation/web-api)

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/ftrbnd/eden-heardle-server.git
   ```
2. Install NPM packages
   ```sh
   yarn install
   ```
5. Start the local dev server
   ```sh
   yarn dev
   ```

### Configuration

Create a `.env` file at the root and fill out the values:
```env
  DRIZZLE_DATABASE_URL=
  SPOTIFY_CLIENT_ID=
  SPOTIFY_CLIENT_SECRET=
  SPOTIFY_REDIRECT_URI="http://localhost:3000/api/auth/login/spotify/callback"

  # must match redirectURL in the On Tour app's AuthProvider
  EXPO_REDIRECT_URL="on.tour://(auth)/sign-in"  

  # UTC time: delete expired sessions every 24 hours
  DAILY_CRON_HOUR=4
  DAILY_CRON_MINUTE=0

  # Fastify’s .listen method default binding uses localhost (127.0.0.1), whereas Render requires 0.0.0.0 
  IS_DEPLOYMENT=false
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- CONTACT -->
## Contact

Giovanni Salas - [@finalcalI](https://twitter.com/finalcali) - giosalas25@gmail.com

Project Link: [https://github.com/ftrbnd/eden-heardle-server](https://github.com/ftrbnd/eden-heardle-server)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[Render]:https://img.shields.io/badge/render-000000?style=for-the-badge&logo=render
[Render-url]: https://render.com
[Fastify]: https://img.shields.io/badge/fastify-000000?style=for-the-badge&logo=fastify
[Fastify-url]: https://fastify.dev
[Typescript]: https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[Typescript-url]: https://www.typescriptlang.org/
[Lucia]: https://img.shields.io/badge/lucia-5F57FF?style=for-the-badge&logo=lucia&logoColor=fff
[Lucia-url]: https://lucia-auth.com/
[Zod]: https://img.shields.io/badge/zod-3E67B1?style=for-the-badge&logo=zod
[Zod-url]: https://zod.dev
[Drizzle]: https://img.shields.io/badge/drizzle-000000?style=for-the-badge&logo=drizzle&logoColor=C5F74F
[Drizzle-url]: https://orm.drizzle.team
[NeonDb]: https://img.shields.io/badge/neon-00e599?style=for-the-badge
[NeonDb-url]: https://neon.tech/

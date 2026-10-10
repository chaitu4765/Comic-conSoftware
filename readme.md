# Comic Con Vizag — Survey Game

An interactive, Family-Feud-style survey game customised for Comic Con Vizag. It provides a host/admin screen, a player-facing game board, team scoring, buzzer support, and a Comic Con question set.

## Requirements

- [Node.js](https://nodejs.org/) 16 or later
- npm (included with Node.js)

## Run locally

1. Clone the repository and open the project folder.

   ```sh
   git clone https://github.com/chaitu4765/Comic-conSoftware.git
   cd Comic-conSoftware
   ```

2. Install the dependencies.

   ```sh
   npm install
   ```

3. Start the development server.

   ```sh
   npm run dev
   ```

4. Open [http://localhost:8000](http://localhost:8000) in your browser.

The server uses port `8000` by default. To use a different port, set the `PORT` environment variable before starting it.

## Production run

Create an optimized build, then start the server:

```sh
npm run build
npm run start
```

On Windows, use this start command instead:

```powershell
npm run start_windows
```

## How to host a game

1. Start the app and open the home page.
2. Select **Host** to open the host/admin controls.
3. Load the Comic Con Vizag survey from the available game list.
4. Use the host controls to reveal answers, award points, manage teams, and advance rounds.
5. Share the player/game-board window with the audience or display it on a second screen.

## Project structure

| Path | Purpose |
| --- | --- |
| `pages/` | Application pages and API routes |
| `components/` | Game board, host controls, buzzer, and UI components |
| `games/` | Survey question sets, including the Comic Con Vizag survey |
| `public/` | Static images, logos, and media |
| `server.js` | Custom Next.js server configuration |

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the development server on port 8000 |
| `npm run build` | Creates a production build |
| `npm run start` | Runs the production server on macOS/Linux |
| `npm run start_windows` | Runs the production server on Windows |
| `npm run dockerbuild` | Builds the Docker image |

## Docker

To build a container image:

```sh
npm run dockerbuild
```

Then run it locally:

```sh
docker run --rm -p 8000:8000 friendlyfeud:latest
```

Open [http://localhost:8000](http://localhost:8000).

## License

See [LICENSE](LICENSE) for license information.

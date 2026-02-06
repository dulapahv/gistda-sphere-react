# gistda-sphere-react Demo

Interactive demo app showcasing the [gistda-sphere-react](../README.md) library. Demonstrates map rendering, markers, drawing tools, search, routing, layer switching, and more.

## Prerequisites

- [Node.js](https://nodejs.org/)
- A Sphere API key from [sphere.gistda.or.th](https://sphere.gistda.or.th/)

## Setup

1. Install dependencies from the `demo/` directory:

   ```sh
   npm install
   ```

2. Create a `.env` file in the `demo/` directory (use `.env.example` as a template):

   ```sh
   cp .env.example .env
   ```

3. Open `.env` and replace the placeholder with your API key:

   ```
   VITE_SPHERE_API_KEY=your_api_key_here
   ```

## Development

Start the dev server:

```sh
npm run dev
```

The app will be available at `http://localhost:5173`.

## Build

Create a production build:

```sh
npm run build
```

Preview the production build locally:

```sh
npm run preview
```

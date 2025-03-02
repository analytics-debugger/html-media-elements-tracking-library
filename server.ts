import { serve } from "bun";

const server = serve({
  port: 3000, // Port to listen on
  async fetch(request) {
    const url = new URL(request.url);
    let filePath: string;

    // Serve files from /dist/* at ./dist/*
    if (url.pathname.startsWith("/dist/")) {
      filePath = `.${url.pathname}`; // Maps /dist/file.js to ./dist/file.js
    } else {
      // Serve everything else from ./playground
      filePath = `./playground${url.pathname}`;
    }

    // Default to index.html if the path is "/"
    if (filePath.endsWith("/")) {
      filePath = `${filePath}index.html`;
    }

    // Serve files
    try {
      const file = Bun.file(filePath);
      if (await file.exists()) {
        return new Response(file);
      } else {
        return new Response("File not found", { status: 404 });
      }
    } catch (error) {
      return new Response("Internal Server Error", { status: 500 });
    }
  },
});

console.log(`Server running at http://localhost:${server.port}`);
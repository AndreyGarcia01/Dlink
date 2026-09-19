import { sql } from "bun";

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": () => {
      new Response("Hello World");
    },
  },
});

console.log(`listen on ${server.port}`);

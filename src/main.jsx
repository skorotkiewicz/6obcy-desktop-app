import React from "react";
import ReactDOM from "react-dom/client";
import Chat from "./Chat";
// import http from "http";
// import WebSocket from "ws";
// import WebSocket from "tauri-plugin-websocket-api";

// function main(arg, agent) {
//   const server = http.createServer();
//   const wss = new WebSocket.Server({ server });
//   server.listen(4444);

//   wss.on("connection", function connection(wss) {
//     const ws = new WebSocket(
//       "wss://server.6obcy.pl:7001/6eio/?EIO=3&transport=websocket",
//       {
//         agent: arg ? agent : false,
//         headers: {
//           "User-Agent":
//             "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:102.0) Gecko/20100101 Firefox/102.0",
//         },
//         origin: "https://6obcy.org",
//       }
//     );

//     ws.on("message", function incoming(data) {
//       wss.send(data.toString());
//     });

//     wss.on("message", function incoming(data) {
//       ws.send(data.toString());
//     });

//     // ws.on('open', function open() {
//     //   console.log('connected - 6obcy');
//     // });

//     // ws.on('close', function close() {
//     //   console.log('disconnected - 6obcy');
//     // });
//   });
// }

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Chat />
  </React.StrictMode>
);

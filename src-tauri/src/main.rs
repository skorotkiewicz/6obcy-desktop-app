#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
#![allow(unused)]

use std::sync::Arc;

use futures_util::{SinkExt, StreamExt};
use http::Request;
use randua;
use tauri_plugin_store::{PluginBuilder, StoreBuilder};
use tokio::task;
use tokio::{net::TcpListener, sync::Mutex};
use tokio_tungstenite::{accept_async, connect_async, tungstenite::Result};

async fn client() -> Result<()> {
    // Client

    let request = Request::builder()
        .method("GET")
        .header("Accept", "*/*")
        .header("Accept-Encoding", "gzip, deflate, br")
        .header("Accept-Language", "pl,en-US;q=0.7,en;q=0.3")
        .header("Cache-Control", "no-cache")
        .header("Connection", "keep-alive, Upgrade")
        .header("DNT", "1")
        .header("Host", "server.6obcy.pl:7002")
        .header("Origin", "https://6obcy.org")
        .header("Pragma", "no-cache")
        .header("Sec-Fetch-Dest", "websocket")
        .header("Sec-Fetch-Mode", "websocket")
        .header("Sec-Fetch-Site", "cross-site")
        .header("Sec-WebSocket-Extensions", "permessage-deflate")
        .header(
            "Sec-WebSocket-Key",
            tungstenite::handshake::client::generate_key(),
        )
        .header("Sec-WebSocket-Version", "13")
        .header("Upgrade", "websocket")
        .header("User-Agent", randua::new().to_string())
        .uri("wss://server.6obcy.pl:7002/6eio/?EIO=3&transport=websocket")
        .body(())?;

    let (ws_remote, _) = connect_async(request).await?;
    let (write_remote, read_remote) = ws_remote.split();

    let read_remote = Arc::new(Mutex::new(read_remote));
    let write_remote = Arc::new(Mutex::new(write_remote));

    let listener = TcpListener::bind("127.0.0.1:4444")
        .await
        .expect("Can't listen");

    while let Ok((stream, _)) = listener.accept().await {
        let ws_local = accept_async(stream).await.expect("Failed to accept");
        let (mut write_local, mut read_local) = ws_local.split();

        let read_remote = read_remote.clone();
        let _handle_one = task::spawn(async move {
            let mut read_remote = read_remote.lock_owned().await;

            while let Some(msg) = read_remote.next().await {
                let msg = msg?;
                if msg.is_text() || msg.is_binary() {
                    write_local.send(msg).await;
                }
            }

            Result::<(), tungstenite::Error>::Ok(())
        });

        let write_remote = write_remote.clone();
        let _handle_two = task::spawn(async move {
            let mut write_remote = write_remote.lock_owned().await;

            while let Some(msg) = read_local.next().await {
                let msg = msg?;
                if msg.is_text() || msg.is_binary() {
                    write_remote.send(msg).await;
                }
            }

            Result::<(), tungstenite::Error>::Ok(())
        });

        // handle_one.await.expect("The task being joined has panicked");
        // handle_two.await.expect("The task being joined has panicked");
    }

    Ok(())
}

fn main() {
    tauri::async_runtime::spawn(client());
    tauri::Builder::default()
        .plugin(PluginBuilder::default().build())
        //   .setup(|app| {
        //   Ok(())
        // })
        .run(tauri::generate_context!())
        .expect("failed to run app");
}

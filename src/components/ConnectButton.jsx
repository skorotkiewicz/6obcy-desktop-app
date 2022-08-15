import React from "react";

const ConnectButton = ({
  startConversation,
  connected,
  connectStatus,
  info,
}) => {
  return (
    <button
      className="p-btn p-btn-sm connectButton"
      onClick={startConversation}
      disabled={
        connected || connectStatus === 0 || info === "Szukam rozmówcy..."
      }
    >
      Połącz
    </button>
  );
};

export default ConnectButton;

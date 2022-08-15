import React from "react";
import AutoConnectBtn from "./AutoConnectBtn";
import WelcomeMessage from "./WelcomeMessage";

const Modal = ({
  openModal,
  setOpenModal,
  reconnect,
  setReconnect,
  welcomeMessage,
  setWelcomeMessage,
  store,
}) => {
  return (
    <div className={`p-modal-background ${openModal ? "nowactive" : ""}`}>
      <div className={`p-modal ${openModal ? "active" : ""}`}>
        <h3>Szybkie ustawienia</h3>

        <AutoConnectBtn reconnect={reconnect} setReconnect={setReconnect} />

        <WelcomeMessage
          welcomeMessage={welcomeMessage}
          setWelcomeMessage={setWelcomeMessage}
          store={store}
        />
        <div className="p-modal-button-container">
          <span onClick={() => setOpenModal((prev) => !prev)}>ok</span>
        </div>
      </div>
    </div>
  );
};

export default Modal;

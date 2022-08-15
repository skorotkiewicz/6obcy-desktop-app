import React from "react";

const WelcomeMessage = ({ welcomeMessage, setWelcomeMessage, store }) => {
  return (
    <div className="autoWelcome">
      <span>Auto wiadomość powitalna</span>

      <input
        type="text"
        value={welcomeMessage}
        placeholder="Treść auto wiadomości"
        className="p-form-text-alt p-form-no-validate"
        onChange={async (e) => {
          setWelcomeMessage(e.target.value);
          await store.set("welcome", e.target.value);
        }}
      />
    </div>
  );
};

export default WelcomeMessage;

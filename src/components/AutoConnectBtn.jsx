import React from "react";

const AutoConnectBtn = ({ reconnect, setReconnect }) => {
  return (
    <label className="p-form-checkbox-cont">
      <input
        type="checkbox"
        checked={reconnect}
        onChange={() => setReconnect((prev) => !prev)}
      />
      <span></span>
      Auto łączenie
    </label>
  );
};

export default AutoConnectBtn;

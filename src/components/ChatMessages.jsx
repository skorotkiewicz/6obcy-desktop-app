import React, { useEffect, useRef } from "react";
import moment from "moment";
import "moment/locale/pl";
moment.locale("pl");

const ChatMessages = ({ messages }) => {
  const divRef = useRef(null);

  useEffect(() => {
    divRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  return (
    <div className="message">
      {messages.map((d, key) => (
        <span key={key} title={moment(d.time).format("dddd, HH:mm:ss")}>
          <span className="date">{moment(d.time).format("HH:mm")} | </span>

          <strong style={{ color: d.who === 1 ? "blue" : "green" }}>
            {d.who === 1 ? "Ja: " : d.who === 2 ? "" : "Obcy: "}
          </strong>
          {d.who === 2 ? <span style={{ color: "red" }}>{d.msg}</span> : d.msg}
          <div ref={divRef}></div>
        </span>
      ))}
    </div>
  );
};

export default ChatMessages;

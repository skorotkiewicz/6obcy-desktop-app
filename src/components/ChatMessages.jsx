import React, { useEffect, useRef } from "react";
import Linkify from "react-linkify";
import moment from "moment";
import "moment/locale/pl";
moment.locale("pl");

const ChatMessages = ({ messages }) => {
  const divRef = useRef(null);

  useEffect(() => {
    divRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  const componentDecorator = (href, text, key) => (
    <a href={href} key={key} target="_blank">
      {text}
    </a>
  );

  return (
    <div className="message">
      {messages.map((d, key) => (
        <span key={key} title={moment(d.time).format("dddd, HH:mm:ss")}>
          <span
            className="date"
            title="Kopiuj wiadomość"
            onClick={() => {
              navigator.clipboard.writeText(d.msg);
            }}
          >
            {moment(d.time).format("HH:mm")} |{" "}
          </span>

          <strong style={{ color: d.who === 1 ? "blue" : "green" }}>
            {d.who === 1 ? "Ja: " : d.who === 2 ? "" : "Obcy: "}
          </strong>
          {d.who === 2 ? (
            <span style={{ color: "red" }}>{d.msg}</span>
          ) : (
            <Linkify componentDecorator={componentDecorator}>{d.msg}</Linkify>
          )}
          <div ref={divRef}></div>
        </span>
      ))}
    </div>
  );
};

export default ChatMessages;

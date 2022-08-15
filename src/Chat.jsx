import React, { useState, useEffect, useRef } from "react";
import { Store } from "./../libs/js/store";
import ChatMessages from "./components/ChatMessages";
import useWebSocket from "react-use-websocket";
import "./Chat.scss";
import AutoConnectBtn from "./components/AutoConnectBtn";
import Modal from "./components/Modal";
import WelcomeMessage from "./components/WelcomeMessage";
import ConnectButton from "./components/ConnectButton";
import ModalCaptcha from "./components/ModalCaptcha";

function Chat() {
  const [ckey, setCkey] = useState("");
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [typing, setTyp] = useState("");
  const [info, setInfo] = useState("");
  const [count, setCount] = useState(0);
  const [connected, setConnected] = useState(false); // user
  const [myTyping, setMyTyping] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [isSolved, setIsSolved] = useState(false);
  const [reconnect, setReconnect] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [topicCountdown, setTopicCountdown] = useState(0);
  const [connectStatus, setConnectStatus] = useState(0); // server
  const [openModal, setOpenModal] = useState(false);
  const [ceid, setCeid] = useState(1);
  const countdown = useRef(null);
  let tcountdown = 0;
  const store = new Store(".settings.dat");

  const { sendMessage, readyState } = useWebSocket("ws://127.0.0.1:4444", {
    onOpen: () => {
      //startConversation();
    },
    onMessage: (e) => {
      _handleSocketMessage(e.data);
      setConnectStatus(readyState);

      const { pingInterval } = parseJson(e.data);
      if (pingInterval > 0) setInterval(() => sendMessage("2"), pingInterval);
    },
    onClose: () => {
      setInfo(null);
      setConnected(false);
      setTyp("");
    },
    shouldReconnect: (closeEvent) => true,
  });

  useEffect(() => {
    const d = setTimeout(() => {
      if (ckey.length > 0) {
        _emitSocketEvent("_mtyp", { ckey: ckey, val: false });
        setMyTyping(false);
      }
    }, 1000);

    return () => clearTimeout(d);
  }, [userMessage]);

  async function init() {
    let myWelcome = await store.get("welcome");
    if (myWelcome) setWelcomeMessage(myWelcome);
  }

  useEffect(() => {
    init();
  }, []);

  const parseJson = (str) => {
    return JSON.parse(str.slice(str.indexOf("{")));
  };

  const startConversation = () => {
    if (connectStatus === 0) return;
    setCeid((prev) => prev + 1);
    topicCountdown !== 0 && resetCountdown();

    _emitSocketEvent("_sas", {
      channel: "main",
      myself: {
        sex: 0,
        loc: 0,
      },
      preferences: {
        sex: 0,
        loc: 0,
      },
    });
    setInfo("Szukam rozmówcy...");
    setMessages([]);
  };

  const _emitSocketEvent = (eventName, eventData) => {
    let eventObj = {};

    if (
      ["_begacked", "_distalk", "_randtopic", "_pmsg", "_sas"].includes(
        eventName
      )
    ) {
      eventObj = {
        ev_name: eventName,
        ev_data: eventData,
        ceid: ceid,
      };
    } else {
      eventObj = {
        ev_name: eventName,
        ev_data: eventData,
      };
    }

    const eventStr = `4${JSON.stringify(eventObj)}`;
    sendMessage(eventStr);
  };

  const _handleSocketMessage = (data) => {
    const msgData = parseJson(data);

    switch (msgData.ev_name) {
      case "talk_s":
        _handleConversationStart(msgData);
        break;

      case "rmsg":
        _handleStrangerMessage(msgData);
        break;

      case "sdis":
        reconnect ? startConversation() : _handleConversationEnd();
        break;

      case "cn_acc":
        _handleCN(msgData);
        break;

      case "capissol":
        _handleResponseCaptcha(msgData);
        break;

      case "caprecvsas":
        _handleCaptacha(msgData);
        break;

      case "capchresp":
        _handleCaptacha(msgData);
        break;

      case "styp":
        _handleStrangerMessageTyp(msgData.ev_data);
        break;

      case "rtopic":
        _handleRandomQuestion(msgData);
        break;

      case "count":
        _handleCount(msgData.ev_data);
        break;
    }
  };

  const _handleResponseCaptcha = (msgData) => {
    let solved = msgData.ev_data.success;
    setIsSolved(solved);

    if (isSolved === false) NewCaptcha();
  };

  const _handleCaptacha = async (msg) => {
    if (msg.ev_data?.wait) {
      setTimeout(() => {
        NewCaptcha();
      }, 1000);
    }

    if (msg.ev_data?.tlce?.data) {
      setCaptcha(msg.ev_data.tlce.data);
    }
  };

  const _handleCN = (msg) => {
    _emitSocketEvent("_cinfo", {
      hash: msg.ev_data.hash,
      dpa: true,
      caper: true,
    });

    startConversation();
  };

  const _handleConversationStart = (msgData) => {
    setCeid((prev) => prev + 1);

    _emitSocketEvent("_begacked", {
      ckey: ckey,
    });

    setCkey(msgData.ev_data.ckey);
    setInfo("Połączono z obcym...");
    setConnected(true);

    welcomeMessage && sendUserMessage(welcomeMessage);
  };

  const _handleStrangerMessage = (msgData) => {
    const uMsg = msgData.ev_data.msg;

    SaveMessage(0, uMsg);
    setInfo(null);
    setTyp("");
  };

  const _handleConversationEnd = () => {
    setInfo("Rozmowa zakończona...");
    setTyp("");
    setConnected(false);
    resetCountdown();

    SaveMessage(2, "Obcy się rozłączył");
  };

  const resetCountdown = () => {
    setTopicCountdown(0);
    tcountdown = 0;
    clearInterval(countdown.current);
  };

  const _handleCount = (c) => {
    setCount(c);
  };

  const _handleRandomQuestion = (msgData) => {
    SaveMessage(2, msgData.ev_data.topic);
  };

  const sendRandTopic = () => {
    if (topicCountdown === 0) {
      setTopicCountdown(60);
      tcountdown = 60;
      setCeid((prev) => prev + 1);

      countdown.current = setInterval(() => {
        if (tcountdown !== 0) {
          setTopicCountdown((prev) => prev - 1);
          tcountdown = tcountdown - 1;
        } else {
          clearInterval(countdown.current);
        }
      }, 1000);

      _emitSocketEvent("_randtopic", {
        ckey: ckey,
      });
    }
  };

  const sendDisconnect = () => {
    setCeid((prev) => prev + 1);

    if (confirmDisconnect) {
      _emitSocketEvent("_distalk", {
        ckey: ckey,
      });
      setCkey("");
      setConnected(false);
      resetCountdown();

      SaveMessage(2, "Rozłączyłeś się");
    } else {
      setConfirmDisconnect(true);

      setTimeout(() => {
        setConfirmDisconnect(false);
      }, 1000);
    }
  };

  const sendUserMessage = (msg) => {
    setCeid((prev) => prev + 1);

    _emitSocketEvent("_pmsg", {
      ckey: ckey,
      msg,
      idn: 0,
    });

    SaveMessage(1, msg);

    setInfo(null);
    setUserMessage("");
  };

  const sendForm = (e) => {
    e.preventDefault();

    const uMsg = userMessage;
    sendUserMessage(uMsg);
  };

  const _handleStrangerMessageTyp = (typ) => {
    if (typ) {
      setTyp("Obcy pisze...");
    } else {
      setTyp("");
    }
  };

  const textinput = (value) => {
    setUserMessage(value);

    if (myTyping === false) {
      _emitSocketEvent("_mtyp", { ckey: ckey, val: true });
      setMyTyping(true);
    }
  };

  const SolveCaptcha = (solved) => {
    _emitSocketEvent("_capsol", {
      solution: solved,
    });

    setCaptcha("");
    startConversation();
  };

  const NewCaptcha = () => {
    _emitSocketEvent("_capch", {});
  };

  const SaveMessage = (who, msg) => {
    connected &&
      setMessages((prev) => [...prev, { time: Date.now(), who, msg }]);
  };

  return (
    <div className="Chat">
      <header>
        <span className={info || connected ? "noneLogo" : ""}>
          6obcy Desktop App
        </span>
        {/* <span>{info ? info : connected && "Połączono"}</span> */}
        <span>
          {captcha ? "Werifikacja" : info ? info : connected && "Połączono"}
        </span>

        {count ? <span>{count} osób online</span> : <span>łączenie...</span>}
      </header>

      <ModalCaptcha
        captcha={captcha}
        setCaptchaText={setCaptchaText}
        captchaText={captchaText}
        SolveCaptcha={SolveCaptcha}
      />

      <Modal
        reconnect={reconnect}
        setReconnect={setReconnect}
        openModal={openModal}
        setOpenModal={setOpenModal}
        welcomeMessage={welcomeMessage}
        setWelcomeMessage={setWelcomeMessage}
        store={store}
      />

      <main>
        <div className="mobileAside">
          <a
            className="openModel"
            onClick={() => setOpenModal((prev) => !prev)}
          >
            <i className="gg-more-vertical-alt"></i>
          </a>
          <button
            className="randMobileTopic"
            onClick={sendRandTopic}
            disabled={!connected}
          >
            <i
              style={{ color: topicCountdown !== 0 ? "gray" : "red" }}
              className="gg-dice-5"
            ></i>
          </button>
        </div>

        <aside>
          <ConnectButton
            startConversation={startConversation}
            connected={connected}
            connectStatus={connectStatus}
            info={info}
          />

          <button
            className="p-btn p-btn-sm"
            onClick={sendDisconnect}
            disabled={!connected}
          >
            {confirmDisconnect ? "Czy na pewno?" : "Rozłącz"}
          </button>
          <button
            className="p-btn p-btn-sm"
            onClick={sendRandTopic}
            disabled={!connected}
          >
            {topicCountdown !== 0
              ? // ? `Kolejny za ${topicCountdown} sekund`
                `Kolejny ${topicCountdown}`
              : "Wylosuj temat"}
          </button>

          <AutoConnectBtn reconnect={reconnect} setReconnect={setReconnect} />
          <WelcomeMessage
            welcomeMessage={welcomeMessage}
            setWelcomeMessage={setWelcomeMessage}
            store={store}
          />
        </aside>
        <div>
          <div className="messages">
            <ChatMessages messages={messages} />
          </div>
          {typing && <span>Obcy pisze...</span>}
          <footer>
            <div className="actionsMobi">
              {connected ? (
                <button
                  className="p-btn p-btn-sm"
                  onClick={sendDisconnect}
                  disabled={!connected}
                >
                  {confirmDisconnect ? "Czy na pewno?" : "Rozłącz"}
                </button>
              ) : (
                <ConnectButton
                  startConversation={startConversation}
                  connected={connected}
                  connectStatus={connectStatus}
                  info={info}
                />
              )}
            </div>

            <form onSubmit={sendForm}>
              <input
                type="text"
                disabled={!connected}
                value={userMessage}
                placeholder="Twoja wiadomość..."
                onChange={(e) => textinput(e.target.value)}
              />
            </form>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default Chat;

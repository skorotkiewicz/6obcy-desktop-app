import React from "react";

const ModalCaptcha = ({
  captcha,
  setCaptchaText,
  captchaText,
  SolveCaptcha,
}) => {
  return (
    <div
      className={`p-modal-background captchaModel ${
        captcha ? "nowactive" : ""
      }`}
    >
      <div className={`p-modal ${captcha ? "active" : ""}`}>
        <h2>Werifikacja</h2>

        <div>Przepisz kod z obrazka (7 znaków)</div>
        <div>
          <img src={captcha} alt="captcha" />
        </div>

        <div>
          <input
            type="text"
            className="p-form-text-alt p-form-no-validate"
            placeholder="Kod z obrazka (7 znaków)"
            onChange={(e) => setCaptchaText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                captchaText && SolveCaptcha(captchaText);
              }
            }}
          />
        </div>

        <div className="p-modal-button-container">
          <span onClick={() => captchaText && SolveCaptcha(captchaText)}>
            Zatwierdź
          </span>
        </div>
      </div>
    </div>
  );
};

export default ModalCaptcha;

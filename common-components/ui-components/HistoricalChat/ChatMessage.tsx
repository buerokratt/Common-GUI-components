import React, { FC, useMemo } from "react";
import { format } from "date-fns";
import { Message } from "../../types/message";
import Markdownify from "../Chat/Markdownify";
import { parseButtons, parseOptions } from "../../utils/parse-utils";
import ButtonMessage from "../ButtonMessage";
import OptionMessage from "../OptionMessage";
import { useTranslation } from "react-i18next";
import { ToastContextType } from "../../context";

type ChatMessageProps = {
  message: Message;
  onMessageClick?: (message: Message) => void;
  toastContext: ToastContextType | null;
};

const ChatMessage: FC<ChatMessageProps> = ({ message, onMessageClick, toastContext }) => {
  const buttons = useMemo(() => parseButtons(message), [message.buttons]);
  const options = useMemo(() => parseOptions(message), [message.options]);
  const { t } = useTranslation();
  const toast = toastContext;

  const handleContextMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const content = message.content ?? "";
    navigator.clipboard
      .writeText(content)
      .then(() => {
        toast?.open({
          type: "success",
          title: t("global.notification"),
          message: t("toast.copied"),
        });
      })
      .catch((err) => {
        toast?.open({
          type: "error",
          title: t("global.notification"),
          message: err?.message,
        });
      });
  };

  return (
    <>
      <div className="historical-chat__message">
        <button
          className="historical-chat__message-text"
          onClick={onMessageClick ? () => onMessageClick(message) : undefined}
          onContextMenu={handleContextMenu}
        >
          <Markdownify message={message.content ?? ""} sanitizeLinks={message.authorRole === "end-user"} />
        </button>
        <time dateTime={message.created} className="historical-chat__message-date">
          {format(new Date(message.created ?? ""), "HH:mm:ss")}
        </time>
      </div>
      {buttons.length > 0 && <ButtonMessage buttons={buttons} />}
      {options.length > 0 && <OptionMessage options={options} />}
    </>
  );
};

export default ChatMessage;

import React, { FC, useMemo } from "react";
import { format } from "date-fns";
import { Message, MessageButton } from "../../types/message";
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
  previousButtons?: MessageButton[];
};

const isButtonPayload = (content: string) =>
  content.startsWith("#service,") || content.startsWith("#common_service,");

const ChatMessage: FC<ChatMessageProps> = ({ message, onMessageClick, toastContext, previousButtons }) => {
  const buttons = useMemo(() => parseButtons(message), [message.buttons]);
  const options = useMemo(() => parseOptions(message), [message.options]);
  const { t } = useTranslation();
  const toast = toastContext;

  const selectedButton = useMemo(() => {
    const content = message.content ?? "";
    if (!isButtonPayload(content)) return null;
    const match = previousButtons?.find((b) => b.payload === content);
    return match ?? { title: content, payload: content };
  }, [message.content, previousButtons]);

  const handleClick = async () => {
    onMessageClick?.(message);

    if (window.getSelection()?.toString()) return;

    try {
      await navigator.clipboard.writeText(message.content ?? "");
      toast?.open({
        type: "success",
        title: t("global.notification"),
        message: t("toast.success.copied"),
      });
    } catch (err) {
      toast?.open({
        type: "error",
        title: t("global.notificationError"),
        message: (err as Error)?.message,
      });
    }
  };

  return (
    <>
      <div className="historical-chat__message">
        {selectedButton ? (
          <ButtonMessage buttons={[selectedButton]} />
        ) : (
          <button
            className="historical-chat__message-text"
            onClick={handleClick}
          >
            <Markdownify message={message.content ?? ""} sanitizeLinks={message.authorRole === "end-user"} />
          </button>
        )}
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

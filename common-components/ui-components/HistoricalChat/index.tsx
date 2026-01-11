import React, { FC, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { MdOutlineModeEditOutline, MdOutlineSave } from "react-icons/md";

import { Button, FormSelect, FormTextarea, Icon, Track } from "../";
import { ReactComponent as BykLogoWhite } from "../../assets/logo-white.svg";
import { CHAT_EVENTS, Chat as ChatType, BACKOFFICE_NAME } from "../../types/chat";
import { Message } from "../../types/message";
import ChatMessage from "./ChatMessage";
import "./HistoricalChat.scss";
import { apiDev } from "../../services/api";
import ChatEvent from "../../ui-components/ChatEvent";
import { ToastContextType } from "../../context";

type ChatProps = {
  chat: ChatType;
  header_link?: string;
  trigger: boolean;
  onChatStatusChange: (event: string) => void;
  onCommentChange: (comment: string) => void;
  selectedStatus: string | null;
  showComment?: boolean;
  showStatus?: boolean;
  toastContext: ToastContextType | null;
  onMessageClick?: (message: Message) => void;
};

type GroupedMessage = {
  name: string;
  title: string;
  type: string;
  messages: Message[];
};

const chatStatuses = [
  CHAT_EVENTS.ACCEPTED,
  CHAT_EVENTS.CLIENT_LEFT_FOR_UNKNOWN_REASONS,
  CHAT_EVENTS.CLIENT_LEFT_WITH_ACCEPTED,
  CHAT_EVENTS.CLIENT_LEFT_WITH_NO_RESOLUTION,
  CHAT_EVENTS.HATE_SPEECH,
  CHAT_EVENTS.OTHER,
  CHAT_EVENTS.RESPONSE_SENT_TO_CLIENT_EMAIL,
];

const HistoricalChat: FC<ChatProps> = ({
  chat,
  header_link,
  trigger,
  selectedStatus,
  onChatStatusChange,
  onCommentChange,
  showComment = true,
  showStatus = true,
  toastContext,
  onMessageClick,
}) => {
  const { t } = useTranslation();
  const chatRef = useRef<HTMLDivElement>(null);
  const [messageGroups, setMessageGroups] = useState<GroupedMessage[]>([]);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [messagesList, setMessagesList] = useState<Message[]>([]);
  const [status, setStatus] = useState<string | null>(selectedStatus ?? null);
  const [lastMessage, setLastMessage] = useState<Message>();
  const [statuses, setStatuses] = useState(chatStatuses);

  useEffect(() => {
    getMessages();
  }, [trigger]);

  useEffect(() => {
    const initializeComponent = () => {
      setMessageGroups([]);
      setMessagesList([]);
      setLastMessage(undefined);
      setStatuses(chatStatuses);
      getMessages();
    };

    initializeComponent();
  }, [chat]);

  const getMessages = async () => {
    if (!chat.id) return;
    const { data: res } = await apiDev.post("agents/messages-by-id", {
      chatId: chat.id,
    });
    setMessagesList(res.response);
  };

  const endUserFullName =
    chat.endUserFirstName && chat.endUserLastName && chat.endUserFirstName !== "" && chat.endUserLastName !== ""
      ? `${chat.endUserFirstName} ${chat.endUserLastName}`
      : t("global.anonymous");

  useEffect(() => {
    setStatus(selectedStatus);
  }, [selectedStatus, status]);

  useEffect(() => {
    if (!messagesList) return;
    let groupedMessages: GroupedMessage[] = [];
    messagesList.forEach((message, i) => {
      const currentMessage = message;
      const content = currentMessage.content?.trim() ?? "";

      if (content.startsWith("#service,") || content.startsWith("#common_service,")) {
        const allPreviousButtons = messagesList
          .slice(0, i)
          .flatMap((msg) => (msg.buttons ? JSON.parse(msg.buttons) : []));
        currentMessage.content = allPreviousButtons.find((b: any) => b.payload.includes(content))?.title ?? content;
      }

      const lastGroup = groupedMessages[groupedMessages.length - 1];
      if (lastGroup?.type === currentMessage.authorRole) {
        if (
          !currentMessage.event ||
          currentMessage.event.toLowerCase() === CHAT_EVENTS.GREETING ||
          currentMessage.event.toLowerCase() === CHAT_EVENTS.WAITING_VALIDATION ||
          currentMessage.event.toLowerCase() === CHAT_EVENTS.APPROVED_VALIDATION
        ) {
          lastGroup.messages.push({
            ...currentMessage,
            content:
              currentMessage.event === CHAT_EVENTS.WAITING_VALIDATION
                ? t("chat.waiting_validation").toString()
                : currentMessage.content,
          });
        } else {
          groupedMessages.push({
            name: "",
            type: "event",
            title: "",
            messages: [{ ...currentMessage }],
          });
        }
      } else {
        const isBackOfficeUser =
          currentMessage.authorRole === "backoffice-user"
            ? `${currentMessage.authorFirstName} ${currentMessage.authorLastName}`
            : BACKOFFICE_NAME.DEFAULT;
        groupedMessages.push({
          name: currentMessage.authorRole === "end-user" ? endUserFullName : isBackOfficeUser,
          type: currentMessage.authorRole,
          title: currentMessage.csaTitle ?? "",
          messages: [{ ...currentMessage }],
        });
      }
    });

    setMessageGroups(groupedMessages);
    const lastMessage = messagesList[messagesList.length - 1];
    if (
      lastMessage?.event?.toLowerCase() === CHAT_EVENTS.CLIENT_LEFT_FOR_UNKNOWN_REASONS ||
      lastMessage?.event?.toLowerCase() === CHAT_EVENTS.HATE_SPEECH ||
      lastMessage?.event?.toLowerCase() === CHAT_EVENTS.OTHER ||
      lastMessage?.event?.toLowerCase() === CHAT_EVENTS.RESPONSE_SENT_TO_CLIENT_EMAIL
    ) {
      setStatuses([CHAT_EVENTS.HATE_SPEECH, CHAT_EVENTS.OTHER, CHAT_EVENTS.RESPONSE_SENT_TO_CLIENT_EMAIL]);
    } else if (
      lastMessage?.event?.toLowerCase() === CHAT_EVENTS.CLIENT_LEFT_WITH_ACCEPTED ||
      lastMessage?.event?.toLowerCase() === CHAT_EVENTS.CLIENT_LEFT_WITH_NO_RESOLUTION
    ) {
      setStatuses([]);
    } else {
      setStatuses(chatStatuses);
    }
    setLastMessage(lastMessage);
  }, [messagesList, endUserFullName]);

  useEffect(() => {
    if (!chatRef.current || !messageGroups) return;
    chatRef.current.scrollIntoView({ block: "end", inline: "end" });
  }, [messageGroups]);

  const isEvent = (group: GroupedMessage) => {
    return (group.type === "event" || group.name.trim() === "" ||  group.messages.some((message) => message.event && !message.content));
  };

  const eventGroup = (group: GroupedMessage) => {
    return group.messages.map((message) => {
      if (message.event && !message.content) {
        return <ChatEvent key={message.id} message={message} />;
      } else {
        return (
          <div key={message.id}>
            <div className="historical-chat__group-header">
            <div className="historical-chat__group-event-initials">
              {group.type === "buerokratt" || group.type === "chatbot" ? (
                <BykLogoWhite height={24} />
              ) : (
                <>
                  {group.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </>
              )}
            </div>
            <div className="historical-chat__group-event-name">
              {group.name}
              {group.title.length > 0 && <div className="title">{group.title}</div>}
            </div>
            </div>
            <div className="historical-chat__messages">
              <ChatMessage
                message={message}
                key={`${message.id ?? ""}`}
                toastContext={toastContext}
                onMessageClick={(message) => {
                  onMessageClick?.(message);
                }}
              />
            </div>
          </div>
        );
      }
    });
  };

  return (
      <div className="historical-chat">
        <div className="historical-chat__body">
          {header_link && <div className={"header-link"}>{header_link}</div>}
          <div className="historical-chat__group-wrapper">
            {messageGroups?.map((group, index) => (
              <div
                className={clsx(["historical-chat__group", `historical-chat__group--${group.type}`])}
                key={`${group.name}-${index}`}
              >
                {isEvent(group) ? (
                  eventGroup(group)
                ) : (
                  <>
                  <div className="historical-chat__group-header">
                    <div className="historical-chat__group-initials">
                      {group.type === "buerokratt" || group.type === "chatbot" ? (
                        <BykLogoWhite height={24} />
                      ) : (
                        <>
                          {group.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </>
                      )}
                    </div>
                    <div className="historical-chat__group-name">
                      {group.name}
                      {group.title.length > 0 && <div className="title">{group.title}</div>}
                    </div>
                  </div>
                    <div className="historical-chat__messages">
                      {group.messages.map((message, i) => (
                        <ChatMessage
                          message={message}
                          key={`${message.id ?? ""}-${i}`}
                          toastContext={toastContext}
                          onMessageClick={(message) => {
                            onMessageClick?.(message);
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
            <div id="anchor" ref={chatRef}></div>
          </div>
          {lastMessage && (
            <div className="historical-chat__toolbar">
              {showComment && (
                <div className="historical-chat__toolbar-row">
                  <Track gap={16} justify="between">
                    {editingComment || editingComment === "" ? (
                      <FormTextarea
                        name="comment"
                        label={t("global.comment")}
                        value={editingComment}
                        hideLabel
                        onChange={(e) => setEditingComment(e.target.value)}
                      />
                    ) : (
                      <p className={`historical-chat__comment-text ${chat.comment ? "" : "placeholder"}`}>
                        {chat.comment ?? t("chat.history.addACommentToTheConversation")}
                      </p>
                    )}
                    {editingComment || editingComment === "" ? (
                      <Button
                        appearance="text"
                        onClick={() => {
                          onCommentChange(editingComment);
                          setEditingComment(null);
                        }}
                      >
                        <Icon icon={<MdOutlineSave />} />
                        {t("global.save")}
                      </Button>
                    ) : (
                      <Button appearance="text" onClick={() => setEditingComment(chat.comment ?? "")}>
                        <Icon icon={<MdOutlineModeEditOutline />} />
                        {t("global.edit")}
                      </Button>
                    )}
                  </Track>
                </div>
              )}
              {showStatus && statuses.length > 0 && (
                <div className="historical-chat__toolbar-row">
                  <FormSelect
                    name="chatStatus"
                    label={t("chat.chatStatus")}
                    direction="up"
                    defaultValue={status ?? ""}
                    onSelectionChange={(selection) => (selection ? onChatStatusChange(selection.value) : null)}
                    options={statuses.map((status) => ({
                      label: t(`chat.events.${status}`, { date: "" }),
                      value: status,
                    }))}
                  />
                </div>
              )}
            </div>
          )}
        </div>
        <div id="anchor" ref={chatRef}></div>
      </div>
  );
};

export default HistoricalChat;

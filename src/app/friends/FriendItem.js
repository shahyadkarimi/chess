"use client";

import { SocketContextData } from "@/context/SocketContext";
import { useUser } from "@/store/useUser";
import Image from "next/image";
import React, { useContext, useState } from "react";
import GameInviteModal from "./GameInviteModal";
import toast from "react-hot-toast";

const FriendItem = ({ userInfo }) => {
  const { onlineUsers, socket } = useContext(SocketContextData);
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const isOnline = onlineUsers.some((item) => item.userId === userInfo._id);

  const handleSendInvite = ({ gameType, gameName, message, betAmount, isFreeGame }) => {
    return new Promise((resolve, reject) => {
      setSending(true);

      // Timeout after 10 seconds
      let timeoutId;

      // Set up one-time listeners
      const wrappedOnInvitationSent = () => {
        clearTimeout(timeoutId);
        socket.off("invitationSent", wrappedOnInvitationSent);
        socket.off("invitationError", wrappedOnInvitationError);
        setSending(false);
        toast.success(`پیشنهاد بازی ${gameName} برای ${userInfo.nickName} ارسال شد!`, {
          style: {
            borderRadius: "10px",
            background: "#040e1c",
            color: "#fff",
            fontSize: "14px",
          },
        });
        resolve();
      };

      const wrappedOnInvitationError = ({ message: errorMessage }) => {
        clearTimeout(timeoutId);
        socket.off("invitationSent", wrappedOnInvitationSent);
        socket.off("invitationError", wrappedOnInvitationError);
        setSending(false);
        toast.error(errorMessage || "خطا در ارسال پیشنهاد بازی", {
          style: {
            borderRadius: "10px",
            background: "#040e1c",
            color: "#fff",
            fontSize: "14px",
          },
        });
        reject(new Error(errorMessage));
      };

      socket.on("invitationSent", wrappedOnInvitationSent);
      socket.on("invitationError", wrappedOnInvitationError);

      // Set timeout
      timeoutId = setTimeout(() => {
        socket.off("invitationSent", wrappedOnInvitationSent);
        socket.off("invitationError", wrappedOnInvitationError);
        setSending(false);
        toast.error("زمان ارسال پیشنهاد به پایان رسید", {
          style: {
            borderRadius: "10px",
            background: "#040e1c",
            color: "#fff",
            fontSize: "14px",
          },
        });
        reject(new Error("زمان ارسال پیشنهاد به پایان رسید"));
      }, 10000);

      // Send invitation with game type and message
      console.log("📤 Sending invitation:", {
        friendId: userInfo._id,
        gameType,
        gameName,
        message,
        betAmount,
        isFreeGame,
        socketConnected: socket.connected,
        socketId: socket.id,
      });

      socket.emit("inviteFriend", {
        friendId: userInfo._id,
        gameType,
        gameName,
        message,
        betAmount: betAmount || 0,
        isFreeGame: isFreeGame || false,
      });
    });
  };

  return (
    <>
      <div className="relative w-full rounded-2xl p-[1px] bg-gradient-to-b from-blueColor/30 via-blueColor/10 to-transparent group hover:from-blueColor/40 hover:via-blueColor/15 transition-all duration-300">
        <div className="relative flex items-center gap-3 rounded-2xl bg-secondaryDarkTheme/80 backdrop-blur-sm p-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="absolute -inset-1 rounded-xl bg-blueColor/20 blur-md group-hover:bg-blueColor/30 transition-colors" />
        <div className="relative">
          <Image
            src={"/avatar.png"}
            width={50}
            height={50}
                className="size-12 rounded-xl object-cover border-2 border-white/10"
            alt={`کاربر ${userInfo.nickName}`}
          />
              {isOnline ? (
                <div className="absolute -bottom-0.5 -right-0.5 flex size-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative flex items-center justify-center rounded-full size-3 bg-emerald-400 border-2 border-secondaryDarkTheme"></span>
                </div>
              ) : (
                <div className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-gray-500 border-2 border-secondaryDarkTheme"></div>
              )}
            </div>
        </div>

          {/* User Info */}
          <div className="flex-1 flex flex-col gap-0.5 min-w-0">
            <span className="text-sm font-semibold text-white truncate">
              {userInfo.nickName}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-blueColor font-medium">
                {userInfo.userName}@
              </span>
              {isOnline && (
                <span className="text-[10px] text-emerald-400 font-medium">
                  آنلاین
          </span>
              )}
        </div>
          </div>

          {/* Invite Button - Only for online friends */}
          {isOnline && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-blueColor/10 border border-blueColor/30 text-blueColor hover:bg-blueColor/20 transition-colors text-xs font-medium flex items-center gap-1.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={14}
                height={14}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              پیشنهاد بازی
            </button>
          )}
      </div>
    </div>

      <GameInviteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        friendName={userInfo.nickName}
        onSendInvite={handleSendInvite}
      />
    </>
  );
};

export default FriendItem;

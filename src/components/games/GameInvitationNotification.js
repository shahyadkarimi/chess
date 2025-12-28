"use client";

import { Button, Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/react";
import { SocketContextData } from "@/context/SocketContext";
import { useUser } from "@/store/useUser";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useState, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { toFarsiNumber } from "@/helper/helper";

const GameInvitationNotification = () => {
  const { socket } = useContext(SocketContextData);
  const { user } = useUser();
  const router = useRouter();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!socket || !user) {
      console.log("GameInvitationNotification: socket or user not available", { socket: !!socket, user: !!user });
      return;
    }

    console.log("GameInvitationNotification: Setting up gameInvitation listener");

    const handleGameInvitation = (data) => {
      console.log("✅ Received game invitation:", data);
      setInvitation(data);
    };

    socket.on("gameInvitation", handleGameInvitation);

    // Also listen for connection events
    socket.on("connect", () => {
      console.log("✅ Socket connected in GameInvitationNotification");
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected in GameInvitationNotification");
    });

    return () => {
      console.log("GameInvitationNotification: Cleaning up listeners");
      socket.off("gameInvitation", handleGameInvitation);
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [socket, user]);

  const handleAccept = useCallback(() => {
    if (!invitation) return;

    setLoading(true);
    socket.emit("acceptInvitation", { invitationId: invitation.invitationId });

    // Use refs to avoid stale closures
    const invitationIdRef = invitation.invitationId;

    // Listen for gameFound event - handle different game types
    const handleGameFound = ({ roomId, isInvitedGame }) => {
      socket.off("gameFound", handleGameFound);
      socket.off("tttGameFound", handleTicTacToeGameFound);
      socket.off("invitationError", handleInvitationError);
      setLoading(false);
      setInvitation(null);
      console.log("✅ Accepter: Game found, redirecting to:", roomId);
      
      // Route based on game type
      const gameType = invitation?.gameType || "rps";
      if (gameType === "tictactoe") {
        router.push(`/tictactoe/${roomId}`);
      } else if (gameType === "chess") {
        // Chess is disabled
        return;
      } else {
        router.push(`/rps/${roomId}`);
      }
    };

    const handleTicTacToeGameFound = ({ roomId, isInvitedGame }) => {
      socket.off("gameFound", handleGameFound);
      socket.off("tttGameFound", handleTicTacToeGameFound);
      socket.off("invitationError", handleInvitationError);
      setLoading(false);
      setInvitation(null);
      router.push(`/tictactoe/${roomId}`);
    };

    const handleInvitationError = ({ message: errorMessage }) => {
      socket.off("gameFound", handleGameFound);
      socket.off("invitationError", handleInvitationError);
      setLoading(false);
      toast.error(errorMessage || "خطا در پذیرش دعوت", {
        style: {
          borderRadius: "10px",
          background: "#040e1c",
          color: "#fff",
          fontSize: "14px",
        },
      });
    };

    socket.on("gameFound", handleGameFound);
    socket.on("tttGameFound", handleTicTacToeGameFound);
    socket.on("invitationError", handleInvitationError);
  }, [invitation, router]);

  const handleReject = useCallback(() => {
    if (!invitation) return;

    socket.emit("rejectInvitation", { invitationId: invitation.invitationId });
    setInvitation(null);
  }, [invitation]);

  const getGameIcon = (gameType) => {
    switch (gameType) {
      case "rps":
        return "/rock-paper-scissors.png";
      case "tictactoe":
        return "/tic-tac-toe.png";
      case "chess":
        return "/chess.png";
      case "poker":
        return "/poker.png";
      default:
        return "/rock-paper-scissors.png";
    }
  };

  if (!invitation) return null;

  return (
    <Modal
      isOpen={!!invitation}
      onClose={handleReject}
      size="md"
      isDismissable={false}
      hideCloseButton={false}
      classNames={{
        base: "bg-primaryDarkTheme",
        backdrop: "bg-black/70 backdrop-blur-sm",
        header: "border-b border-white/5",
        body: "py-4",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-lg font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                پیشنهاد بازی
              </h2>
              <p className="text-xs text-gray-400 font-normal">
                {invitation.from.nickName} برای شما پیشنهاد بازی فرستاده است
              </p>
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                {/* Inviter Info */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondaryDarkTheme/50 border border-white/5">
                  <div className="relative">
                    <Image
                      src={"/avatar.png"}
                      width={50}
                      height={50}
                      className="size-12 rounded-xl object-cover border-2 border-white/10"
                      alt={invitation.from.nickName}
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-400 border-2 border-secondaryDarkTheme"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">
                      {invitation.from.nickName}
                    </p>
                    <p className="text-xs text-blueColor">
                      @{invitation.from.userName}
                    </p>
                  </div>
                </div>

                {/* Game Info */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondaryDarkTheme/50 border border-white/5">
                  <div className="relative size-12 rounded-xl bg-primaryDarkTheme/50 flex items-center justify-center border border-white/5">
                    <Image
                      src={getGameIcon(invitation.gameType)}
                      width={32}
                      height={32}
                      alt={invitation.gameName}
                      className="size-8 object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">
                      {invitation.gameName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {invitation.isFreeGame 
                        ? "بازی رایگان" 
                        : `مبلغ شرط: ${toFarsiNumber((invitation.betAmount || 0).toString())} تومان`}
                    </p>
                  </div>
                </div>

                {/* Message */}
                {invitation.message && (
                  <div className="p-3 rounded-xl bg-blueColor/10 border border-blueColor/20">
                    <p className="text-xs text-gray-400 mb-1">پیام:</p>
                    <p className="text-sm text-white">{invitation.message}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    onClick={handleReject}
                    variant="light"
                    className="flex-1 text-gray-400 hover:text-white border border-white/10"
                    disabled={loading}
                  >
                    رد کردن
                  </Button>
                  <Button
                    onClick={handleAccept}
                    isLoading={loading}
                    className="flex-1 !bg-blueColor !text-white !shadow-none hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all"
                  >
                    پذیرفتن
                  </Button>
                </div>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default GameInvitationNotification;

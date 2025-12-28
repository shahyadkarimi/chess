"use client";
import { useUser } from "@/store/useUser";
import React, { createContext, useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getSocket } from "@/lib/socket";

export const SocketContextData = createContext();

const socket = getSocket();

const SocketContext = ({ children, userInfo }) => {
  const user = userInfo?.user;
  const [onlineUsers, setOnlineUsers] = useState([]);
  const router = useRouter();
  const userRef = useRef(user);

  // Update ref when user changes
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Memoize handlers to prevent re-creation
  const handleGameFound = useCallback(({ roomId, isInvitedGame, gameType }) => {
    // Only handle if it's an invited game (to avoid conflicts with RockPaperScissors component)
    if (isInvitedGame) {
      console.log("✅ Game found for invited game, redirecting to:", roomId);
      toast.success("حریف شما دعوت را پذیرفت! در حال انتقال به بازی...", {
        duration: 3000,
        style: {
          borderRadius: "10px",
          background: "#040e1c",
          color: "#fff",
          fontSize: "14px",
        },
      });
      // Route based on game type
      if (gameType === "tictactoe") {
        router.push(`/tictactoe/${roomId}`);
      } else if (gameType === "chess") {
        // Chess is disabled
        return;
      } else {
        router.push(`/rps/${roomId}`);
      }
    }
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const handleConnect = () => {
      console.log("✅ Socket connected in SocketContext, emitting userInfo");
      const currentUser = userRef.current;
      if (currentUser) {
        socket.emit("userInfo", {
          userId: currentUser._id,
          userName: currentUser.userName,
          nickName: currentUser.nickName,
        });
      }
    };

    const handleDisconnect = () => {
      console.log("❌ Socket disconnected in SocketContext");
    };

    // If already connected, emit userInfo immediately
    if (socket.connected) {
      console.log("Socket already connected, emitting userInfo");
    socket.emit("userInfo", {
      userId: user._id,
      userName: user.userName,
      nickName: user.nickName,
    });
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("onlineUsers", (users) => {
      console.log("Received onlineUsers:", users.length);
      setOnlineUsers(users);
    });
    socket.on("gameFound", handleGameFound);

    // Cleanup on unmount
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("onlineUsers");
      socket.off("gameFound", handleGameFound);
    };
  }, [user?._id, handleGameFound]); // Only depend on user._id, not the whole user object

  return (
    <SocketContextData.Provider value={{ onlineUsers, socket }}>
      {children}
    </SocketContextData.Provider>
  );
};

export default SocketContext;

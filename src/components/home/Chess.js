"use client";

import Image from "next/image";

const Chess = ({ user }) => {
  return (
    <button
      disabled
      className="relative w-full h-36 rounded-3xl p-[1px] group bg-gradient-to-b from-gray-500/40 via-gray-500/10 to-transparent opacity-50 cursor-not-allowed"
    >
      <div className="relative w-full h-full flex flex-col justify-center items-center gap-2 rounded-3xl bg-secondaryDarkTheme/95 backdrop-blur-xl">
        <div className="size-14 flex items-center justify-center">
          <Image
            src={"/chess.png"}
            width={56}
            height={56}
            alt="شطرنج"
            className="drop-shadow-[0_0_18px_rgba(59,130,246,0.6)]"
          />
        </div>
        <span className="absolute top-2 left-2 rounded-full border border-gray-500/40 bg-gray-500/10 px-2 py-[2px] text-[9px] font-medium text-gray-500 z-20">
          غیرفعال
        </span>
        <span className="text-xs font-semibold text-gray-500">
          شطرنج
        </span>
        <span className="text-[10px] text-gray-500">
          به زودی...
        </span>
      </div>
    </button>
  );
};

export default Chess;

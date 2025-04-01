"use client";

import Image from "next/image";
import React from "react";

const RPSGameButtons = () => {
  return (
    <div className="w-full h-full relative max-w-[450px]">
      <button className="w-32 h-16 flex justify-center items-center rounded-t-full bg-secondaryDarkTheme absolute left-2/4 -translate-x-2/4 -bottom-5">
        <Image
          src={"/rps/random-icon.svg"}
          width={100}
          height={100}
          className="size-7 block -mb-3"
        />
      </button>

      <button className="w-16 h-16 flex justify-center items-center rounded-full bg-secondaryDarkTheme absolute left-2/4 -translate-x-2/4 bottom-2 -ml-[100px]">
        <Image
          src={"/rps/r-icon.svg"}
          width={100}
          height={100}
          className="size-8 block"
        />
      </button>

      <button className="w-16 h-16 flex justify-center items-center rounded-full bg-secondaryDarkTheme absolute left-2/4 -translate-x-2/4 bottom-[60px]">
        <Image
          src={"/rps/p-icon.svg"}
          width={100}
          height={100}
          className="size-8 block"
        />
      </button>

      <button className="w-16 h-16 flex justify-center items-center rounded-full bg-secondaryDarkTheme absolute left-2/4 -translate-x-2/4 bottom-2 ml-[100px]">
        <Image
          src={"/rps/s-icon.svg"}
          width={100}
          height={100}
          className="size-8 block"
        />
      </button>
    </div>
  );
};

export default RPSGameButtons;

"use client";
import { toFarsiNumber } from "@/helper/helper";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import FriendRequestItem from "./FriendRequestItem";

const FriendRequests = ({ data }) => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        onClick={() => setOpenDrawer(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blueColor text-white transition-colors group"
      >
        <span className="text-sm font-semibold">درخواست‌ها</span>
        {data?.length > 0 && (
          <div className="size-5 text-[10px] bg-red-500 text-white flex justify-center items-center rounded-lg font-semibold group-hover:scale-110 transition-transform">
            {toFarsiNumber(data.length)}
          </div>
        )}
      </button>

      <div
        onClick={() => setOpenDrawer(false)}
        className={`${
          openDrawer ? "opacity-100 visible" : "opacity-0 invisible"
        } bg-black/70 backdrop-blur-sm w-full h-full fixed top-0 bottom-0 right-0 z-40 transition-all duration-300`}
      ></div>

      <div
        className={`${
          openDrawer ? "bottom-0" : "-bottom-full"
        } w-full max-h-[80vh] right-0 bg-primaryDarkTheme absolute z-50 rounded-t-3xl transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.5)]`}
      >
        <div className="w-full h-full p-5 pb-28 relative flex flex-col gap-4 pt-12 overflow-y-auto">
          <span className="w-20 h-1.5 rounded-full bg-gray-600 absolute top-4 left-2/4 -translate-x-2/4 block"></span>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              درخواست‌های دوستی
            </h2>
            <div className="flex items-center gap-3">
              {data?.length > 0 && (
                <span className="text-xs text-gray-400">
                  {toFarsiNumber(data.length)} درخواست
                </span>
              )}
              <button
                onClick={() => router.refresh()}
                className="p-2 rounded-xl bg-blueColor/10 hover:bg-blueColor/20 border border-blueColor/30 text-blueColor transition-all duration-200 hover:scale-110 active:scale-95"
                title="رفرش"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="rotate-180"
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M3 21v-5h5" />
                </svg>
              </button>
            </div>
          </div>

          {data?.length ? (
            <div className="w-full flex flex-col gap-3">
              {data.map((item) => (
                <FriendRequestItem key={item._id} userInfo={item} />
              ))}
            </div>
          ) : (
            <div className="relative w-full rounded-2xl p-[1px] bg-gradient-to-b from-blueColor/30 via-blueColor/10 to-transparent">
              <div className="relative flex flex-col items-center justify-center gap-3 rounded-2xl bg-secondaryDarkTheme/95 backdrop-blur-xl p-6">
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-2xl">
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blueColor/5 blur-3xl" />
                </div>
                <p className="text-sm text-gray-400 text-center">
                  درخواستی وجود ندارد
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FriendRequests;

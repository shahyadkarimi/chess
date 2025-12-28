"use client";

import { toFarsiNumber } from "@/helper/helper";
import { useUser } from "@/store/useUser";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export const ranks = [
  { id: 1, name: "کهربا", icon: "/ranks/rank-1.png" },
  { id: 2, name: "اوپال", icon: "/ranks/rank-2.png" },
  { id: 3, name: "یشم", icon: "/ranks/rank-3.png" },
  { id: 4, name: "مرمر", icon: "/ranks/rank-4.png" },
  { id: 5, name: "فیروزه", icon: "/ranks/rank-5.png" },
  { id: 6, name: "زمرد", icon: "/ranks/rank-6.png" },
  { id: 7, name: "یاقوت", icon: "/ranks/rank-7.png" },
  { id: 8, name: "الماس", icon: "/ranks/rank-8.png" },
];

// position: absolute;
// width: 120px;
// height: 120px;
// top: 10px;
// z-index: 1;
// filter: blur(60px);

const Header = () => {
  const { user } = useUser();
  const userRankIndex = (user?.rank || 1) - 1; // rank is 1-8, array index is 0-7
  const userRank = ranks[userRankIndex] || ranks[0];

  return (
    <div className="w-full flex flex-col gap-3">
      {/* user info & profile button */}
      <div className="w-full rounded-2xl p-[1px] bg-gradient-to-b from-blueColor/40 via-blueColor/20 to-blueColor/40 shadow-[0_0_20px_rgba(15,23,42,0.8)]">
        <div className="flex items-center justify-between rounded-2xl bg-secondaryDarkTheme/95 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Image
                src={"/avatar.png"}
                width={100}
                height={100}
                className="size-12 object-cover rounded-2xl border border-white/15"
                alt={`${user?.nickName} - پروفایل`}
              />
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-gray-400">خوش برگشتی</span>
              <h2 className="text-sm font-semibold text-white">
                {user?.nickName}
              </h2>

              <div className="flex items-center gap-2">
                {user?.phoneNumber && (
                  <span className="text-xs text-gray-500">
                    {toFarsiNumber(user?.phoneNumber)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <Link
              href={"/wallet"}
              className="flex items-center gap-1 rounded-xl border border-emerald-400/50 bg-emerald-400/10 px-3 h-9 text-[11px] font-medium text-emerald-400 hover:bg-emerald-400/20 transition-colors"
            >
              <Icon
                icon="solar:dollar-minimalistic-linear"
                width={16}
                height={16}
                className="text-emerald-400"
              />
              <span>
                {toFarsiNumber((user?.balance || 0))} تومان
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* rank badge */}
      <Link
        href="/leaderboard"
        className="w-full rounded-2xl p-[1px] bg-gradient-to-b from-blueColor/40 via-blueColor/20 to-blueColor/40 shadow-[0_0_20px_rgba(15,23,42,0.8)] hover:from-blueColor/50 hover:via-blueColor/30 hover:to-blueColor/50 transition-all duration-300 group"
      >
        <div className="h-full flex items-center justify-between rounded-2xl bg-secondaryDarkTheme/95 px-4 cursor-pointer">
          <div className="flex items-center gap-2">
            <Icon
              icon="solar:trophy-linear"
              width={18}
              height={18}
              className="text-yellow-400 group-hover:scale-110 transition-transform"
            />
            <span className="text-sm font-medium text-white">
              {userRank.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="block text-sm text-emerald-400 font-medium">
              {toFarsiNumber((user?.totalScore || 0).toString())}
            </span>

            <div className="relative w-10 h-10">
              <Image
                src={userRank.icon}
                width={100}
                height={100}
                className="w-8 left-0 absolute top-2/4 -translate-y-2/4 z-[2]"
                alt="user rank"
              />

              <Image
                src={userRank.icon}
                width={200}
                height={200}
                className="min-w-10 absolute -top-0 -left-0.5 z-[1] blur-sm opacity-50"
                alt="user rank"
              />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Header;

"use client";

import Background from "@/components/chessboard/Background";
import Navbar from "@/components/navbar/Navbar";
import React from "react";
import SearchFriends from "./SearchFriends";
import { useQuery } from "@tanstack/react-query";
import FriendItem from "./FriendItem";
import { Spinner } from "@heroui/react";

const fetchData = async ({}) => {
  const res = await fetch("/api/friends/get-all", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error("مشکلی پیش آمد!");

  return res.json();
};

const page = () => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: fetchData,
  });

  return (
    <div className="relative max-w-[450px] flex flex-col items-center gap-5 w-full h-screen bg-primaryDarkTheme overflow-hidden p-5">
      <Navbar />
      <Background />

      <div className="w-full flex flex-col items-center gap-1">
        <h1 className="text-2xl font-black bg-gradient-to-b from-white to-gray-600 bg-clip-text text-transparent">
          دوستان شما
        </h1>

        <p className="text-blueColor text-xs">
          دوستاتو پیدا کن و باهاشون شرطی بزن !
        </p>
      </div>

      <SearchFriends />

      <div className="w-full flex flex-col gap-3 -mt-1.5">
        <h2 className="bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
          دوستان شما
        </h2>

        {isLoading ? (
          <Spinner
            size="sm"
            label="درحال بارگذاری..."
            classNames={{
              label: "text-xs",
              circle1: "border-b-blueColor",
              circle2: "border-b-blueColor",
            }}
          />
        ) : data?.friendsList?.length ? (
          data?.friendsList.map((item) => (
            <FriendItem key={item._id} userInfo={item} />
          ))
        ) : (
          <div className="w-full flex justify-center items-center bg-secondaryDarkTheme h-14 rounded-2xl text-xs">
            <span>دوستی اد نکرده اید !</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default page;

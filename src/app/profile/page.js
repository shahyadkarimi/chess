"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/store/useUser";
import { putData, getData, postData } from "@/services/API";
import ProfileEditForm from "./ProfileEditForm";
import Background from "@/components/chessboard/Background";
import Navbar from "@/components/navbar/Navbar";
import Image from "next/image";
import { toFarsiNumber } from "@/helper/helper";
import { ranks } from "@/components/header/Header";
import { Icon } from "@iconify/react";
import { Spinner, Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await getData("/user/stats");
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error("خطا در دریافت آمار:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSave = (updatedData) => {
    setLoading(true);

    putData("/user/update-profile", updatedData)
      .then((res) => {
        if (res.data.success) {
          setUser(res.data.user);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("خطا در به‌روزرسانی پروفایل:", err);
        setLoading(false);
      });
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await postData("/user/logout");
      setUser({});
      toast.success("خروج با موفقیت انجام شد", {
        style: {
          borderRadius: "10px",
          background: "#040e1c",
          color: "#fff",
          fontSize: "14px",
        },
      });
      router.push("/auth");
    } catch (error) {
      console.error("خطا در خروج:", error);
      toast.error("خطا در خروج از حساب کاربری", {
        style: {
          borderRadius: "10px",
          background: "#040e1c",
          color: "#fff",
          fontSize: "14px",
        },
      });
      setLoggingOut(false);
    }
  };

  if (!user) {
    return (
      <div className="relative max-w-[450px] flex flex-col items-center justify-center gap-5 w-full h-screen bg-primaryDarkTheme overflow-hidden p-5">
        <Navbar />
        <Background />
        <div className="text-white text-sm">در حال بارگذاری...</div>
      </div>
    );
  }

  const joinDate = new Date(user.createdAt);
  const daysSinceJoin = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
  const userRankIndex = (user?.rank || 1) - 1;
  const userRank = ranks[userRankIndex] || ranks[0];

  const StatCard = ({ title, value, icon, colorClass = "text-blueColor" }) => (
    <div className="relative w-full rounded-2xl p-[1px] bg-gradient-to-b from-blueColor/30 via-blueColor/10 to-transparent">
      <div className="relative rounded-2xl bg-secondaryDarkTheme/80 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-gray-400">{title}</span>
            <span className={`text-lg font-bold ${colorClass}`}>{value}</span>
          </div>
          {icon && (
            <div className={`${colorClass} opacity-50`}>
              {icon}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const GameStatsCard = ({ gameName, stats, icon }) => {
    if (!stats || stats.total === 0) return null;
    
    const winRate = parseFloat(stats.winRate || 0);
    
    return (
      <div className="relative w-full rounded-2xl p-[1px] bg-gradient-to-b from-blueColor/30 via-blueColor/10 to-transparent">
        <div className="relative rounded-2xl bg-secondaryDarkTheme/80 backdrop-blur-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            {icon}
            <h3 className="text-sm font-semibold text-white">{gameName}</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-gray-400">برد</span>
              <span className="text-sm font-bold text-emerald-400">
                {toFarsiNumber(stats.wins.toString())}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-gray-400">باخت</span>
              <span className="text-sm font-bold text-red-400">
                {toFarsiNumber(stats.losses.toString())}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-gray-400">مساوی</span>
              <span className="text-sm font-bold text-gray-400">
                {toFarsiNumber(stats.draws.toString())}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <span className="text-[10px] text-gray-400">درصد برد</span>
            <span className="text-sm font-bold text-blueColor">
              {toFarsiNumber(winRate.toString())}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative max-w-[450px] flex flex-col items-center gap-5 w-full min-h-screen pb-24 bg-primaryDarkTheme overflow-hidden p-5">
      <Navbar />
      <Background />

      {/* Profile Header Card */}
      <div className="w-full mt-2 z-10">
        <div className="relative w-full rounded-3xl p-[1px] bg-gradient-to-b from-blueColor/50 via-blueColor/20 to-transparent shadow-[0_0_30px_rgba(59,130,246,0.3)]">
          <div className="relative flex flex-col items-center gap-4 rounded-3xl bg-secondaryDarkTheme/95 backdrop-blur-xl p-6">
            {/* Background glow effects */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blueColor/5 blur-3xl" />
              <div className="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-emerald-400/5 blur-3xl" />
            </div>

            {/* Avatar */}
            <div className="relative">
              <div className="absolute -inset-2 rounded-2xl bg-blueColor/30 blur-xl animate-pulse" />
              <div className="relative">
                <Image
                  src={"/avatar.png"}
                  width={100}
                  height={100}
                  alt="پروفایل کاربر"
                  className="size-20 rounded-3xl border-2 border-white/10 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                />
                <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-emerald-400 border-2 border-secondaryDarkTheme shadow-lg">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="flex flex-col items-center gap-1">
              <h1 className="text-xl font-black bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                {user.nickName}
              </h1>
              <span className="text-xs text-blueColor font-medium">{user.userName}@</span>
            </div>

            {/* Rank Badge */}
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <Image
                  src={userRank.icon}
                  width={100}
                  height={100}
                  className="w-7 left-0 absolute top-2/4 -translate-y-2/4 z-[2]"
                  alt={userRank.name}
                />
              </div>
              <span className="text-sm font-medium text-white">{userRank.name}</span>
              <span className="text-xs text-emerald-400">
                {toFarsiNumber((user?.totalScore || 0).toString())} امتیاز
              </span>
            </div>

            {/* Join Date Badge */}
            <div className="flex items-center gap-2 mt-1">
              <span className="rounded-full border border-blueColor/40 bg-blueColor/10 px-3 py-1 text-[10px] font-medium text-blueColor">
                عضو شده از {new Date(user.createdAt).toLocaleDateString("fa-IR", { year: "numeric", month: "long" })}
              </span>
              {daysSinceJoin > 0 && (
                <span className="text-[10px] text-gray-400">
                  ({toFarsiNumber(daysSinceJoin.toString())} روز)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overall Stats */}
      {loadingStats ? (
        <div className="w-full flex justify-center items-center py-10 z-10">
          <Spinner
            classNames={{
              circle1: "border-b-blueColor",
              circle2: "border-b-blueColor",
            }}
          />
        </div>
      ) : stats ? (
        <div className="w-full flex flex-col gap-4 z-10">
          {/* Overall Stats Section */}
          <div className="w-full flex flex-col gap-1 mb-1">
            <h2 className="text-lg font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              آمار کلی
            </h2>
            <p className="text-xs text-gray-400">
              عملکرد کلی شما در تمام بازی‌ها
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard
              title="کل بازی‌ها"
              value={toFarsiNumber(stats.overall.totalGames.toString())}
              icon={<Icon icon="solar:gamepad-bold" width={24} height={24} />}
              colorClass="text-blueColor"
            />
            <StatCard
              title="درصد برد"
              value={`${toFarsiNumber(stats.overall.winRate.toString())}%`}
              icon={<Icon icon="solar:trophy-bold" width={24} height={24} />}
              colorClass="text-emerald-400"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <StatCard
              title="برد"
              value={toFarsiNumber(stats.overall.wins.toString())}
              colorClass="text-emerald-400"
            />
            <StatCard
              title="باخت"
              value={toFarsiNumber(stats.overall.losses.toString())}
              colorClass="text-red-400"
            />
            <StatCard
              title="مساوی"
              value={toFarsiNumber(stats.overall.draws.toString())}
              colorClass="text-gray-400"
            />
          </div>

          {/* Game Specific Stats */}
          <div className="w-full flex flex-col gap-1 mb-1 mt-2">
            <h2 className="text-lg font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              آمار بازی‌ها
            </h2>
            <p className="text-xs text-gray-400">
              عملکرد شما در هر بازی
            </p>
          </div>

          <GameStatsCard
            gameName="سنگ کاغذ قیچی"
            stats={stats.rps}
            icon={<Icon icon="solar:hand-stars-bold" width={20} height={20} className="text-blueColor" />}
          />

          <GameStatsCard
            gameName="دوز"
            stats={stats.tictactoe}
            icon={<Icon icon="solar:tic-tac-toe-bold" width={20} height={20} className="text-blueColor" />}
          />
        </div>
      ) : null}

      {/* Form Section */}
      <div className="w-full flex flex-col gap-4 z-10">
        <div className="w-full flex flex-col gap-1 mb-1">
          <h2 className="text-lg font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            ویرایش اطلاعات
          </h2>
          <p className="text-xs text-gray-400">
            اطلاعات خود را به‌روزرسانی کنید
          </p>
        </div>

        <ProfileEditForm
          user={user}
          onSave={handleSave}
          loading={loading}
        />

        {/* Logout Button */}
        <div className="w-full mt-4">
          <Button
            onClick={handleLogout}
            isLoading={loggingOut}
            className="w-full !bg-red-500/10 !text-red-400 border border-red-500/30 hover:!bg-red-500/20 transition-all"
            startContent={
              !loggingOut && (
                <Icon icon="solar:logout-2-bold" width={20} height={20} />
              )
            }
          >
            {loggingOut ? "در حال خروج..." : "خروج از حساب کاربری"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

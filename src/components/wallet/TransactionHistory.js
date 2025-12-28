"use client";

import { toFarsiNumber } from "@/helper/helper";
import { cn, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import React, { useState, useMemo } from "react";

const TransactionHistory = ({ transactions, isLoading, onBack }) => {
  const [filterType, setFilterType] = useState("all"); // "all", "deposit", "withdraw"

  const filteredTransactions = useMemo(() => {
    if (filterType === "all") {
      return transactions;
    }
    return transactions.filter((tx) => tx.type === filterType);
  }, [transactions, filterType]);

  return (
    <div className="w-full flex flex-col gap-4 z-10">
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={onBack}
          className="size-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition-all"
        >
          <Icon
            icon="solar:arrow-right-bold"
            width={20}
            height={20}
            className="text-gray-400"
          />
        </button>
        <div className="flex flex-col">
          <h2 className="text-lg font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            تاریخچه تراکنش‌ها
          </h2>
          <p className="text-xs text-gray-400">تمام تراکنش‌های شما</p>
        </div>
      </div>

      {/* Filter Badges */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setFilterType("all")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border",
            filterType === "all"
              ? "bg-purple-500/20 border-purple-500/50 text-purple-400"
              : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
          )}
        >
          همه
        </button>
        <button
          onClick={() => setFilterType("deposit")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5",
            filterType === "deposit"
              ? "bg-blueColor/20 border-blueColor/50 text-blueColor"
              : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
          )}
        >
          <Icon
            icon="solar:arrow-up-bold"
            width={14}
            height={14}
            className={filterType === "deposit" ? "text-blueColor" : "text-gray-400"}
          />
          واریزها
        </button>
        <button
          onClick={() => setFilterType("withdraw")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5",
            filterType === "withdraw"
              ? "bg-amber-400/20 border-amber-400/50 text-amber-400"
              : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
          )}
        >
          <Icon
            icon="solar:arrow-down-bold"
            width={14}
            height={14}
            className={filterType === "withdraw" ? "text-amber-400" : "text-gray-400"}
          />
          برداشت‌ها
        </button>
      </div>

      {/* Transactions List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" color="primary" />
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="relative w-full rounded-3xl p-[1px] bg-gradient-to-b from-gray-500/20 via-gray-500/10 to-transparent">
          <div className="relative flex flex-col items-center justify-center gap-3 rounded-3xl bg-secondaryDarkTheme/95 backdrop-blur-xl p-8">
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gray-500/5 blur-3xl" />
            </div>
            <div className="size-16 rounded-full bg-gray-500/10 flex items-center justify-center">
              <Icon
                icon="solar:history-bold"
                width={32}
                height={32}
                className="text-gray-400"
              />
            </div>
            <p className="text-sm text-gray-400 text-center">
              {filterType === "all"
                ? "هنوز تراکنشی ثبت نشده است"
                : filterType === "deposit"
                ? "تراکنش واریزی ثبت نشده است"
                : "تراکنش برداشتی ثبت نشده است"}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredTransactions.map((transaction) => {
            const getTypeInfo = () => {
              switch (transaction.type) {
                case "deposit":
                  return {
                    label: "واریز",
                    icon: "solar:arrow-up-bold",
                    color: "text-blueColor",
                    bgColor: "bg-blueColor/10",
                    borderColor: "border-blueColor/30",
                    amountColor: "text-blueColor",
                    sign: "+",
                  };
                case "withdraw":
                  return {
                    label: "برداشت",
                    icon: "solar:arrow-down-bold",
                    color: "text-amber-400",
                    bgColor: "bg-amber-400/10",
                    borderColor: "border-amber-400/30",
                    amountColor: "text-amber-400",
                    sign: "-",
                  };
                default:
                  return {
                    label: "تراکنش",
                    icon: "solar:history-bold",
                    color: "text-gray-400",
                    bgColor: "bg-gray-500/10",
                    borderColor: "border-gray-500/30",
                    amountColor: "text-gray-400",
                    sign: "",
                  };
              }
            };

            const getStatusInfo = () => {
              const status = transaction.paymentStatus || "completed";
              switch (status) {
                case "completed":
                  return {
                    label: "موفق",
                    icon: "solar:check-circle-linear",
                    color: "text-emerald-400",
                    bgColor: "bg-emerald-400/10",
                    borderColor: "border-emerald-400/30",
                  };
                case "pending":
                  return {
                    label: "در انتظار",
                    icon: "solar:clock-circle-linear",
                    color: "text-amber-400",
                    bgColor: "bg-amber-400/10",
                    borderColor: "border-amber-400/30",
                  };
                case "failed":
                  return {
                    label: "ناموفق",
                    icon: "solar:close-circle-linear",
                    color: "text-red-400",
                    bgColor: "bg-red-400/10",
                    borderColor: "border-red-400/30",
                  };
                case "cancelled":
                  return {
                    label: "لغو شده",
                    icon: "solar:minus-circle-linear",
                    color: "text-gray-400",
                    bgColor: "bg-gray-500/10",
                    borderColor: "border-gray-500/30",
                  };
                default:
                  return {
                    label: "نامشخص",
                    icon: "solar:question-circle-linear",
                    color: "text-gray-400",
                    bgColor: "bg-gray-500/10",
                    borderColor: "border-gray-500/30",
                  };
              }
            };

            const typeInfo = getTypeInfo();
            const statusInfo = getStatusInfo();
            const date = new Date(transaction.createdAt);
            const formattedDate = date.toLocaleDateString("fa-IR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={transaction._id}
                className="relative rounded-2xl p-[1px] bg-gradient-to-b from-white/5 to-transparent"
              >
                <div className="relative rounded-2xl bg-secondaryDarkTheme/50 backdrop-blur-sm p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`size-12 rounded-xl ${typeInfo.bgColor} border ${typeInfo.borderColor} flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon
                        icon={typeInfo.icon}
                        width={20}
                        height={20}
                        className={typeInfo.color}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      {/* Header Row */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-semibold text-white truncate">
                            {typeInfo.label}
                          </span>
                          {/* Status Badge */}
                          {transaction.paymentStatus && (
                            <div
                              className={`px-2 py-0.5 rounded-lg ${statusInfo.bgColor} border ${statusInfo.borderColor} flex items-center gap-1 flex-shrink-0`}
                            >
                              <Icon
                                icon={statusInfo.icon}
                                width={12}
                                height={12}
                                className={statusInfo.color}
                              />
                              <span
                                className={`text-[10px] font-medium ${statusInfo.color}`}
                              >
                                {statusInfo.label}
                              </span>
                            </div>
                          )}
                        </div>
                        <span
                          className={`text-base font-bold ${typeInfo.amountColor} whitespace-nowrap`}
                        >
                          {typeInfo.sign}
                          {toFarsiNumber(transaction.amount)} تومان
                        </span>
                      </div>

                      {/* Description */}
                      {transaction.description && (
                        <p className="text-[11px] text-gray-400 line-clamp-2">
                          {toFarsiNumber(transaction.description)}
                        </p>
                      )}

                      {/* Footer Row */}
                      <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/5">
                        <div className="flex items-center gap-2 text-[10px] text-gray-500">
                          <Icon
                            icon="solar:calendar-linear"
                            width={12}
                            height={12}
                          />
                          <span className="whitespace-nowrap">
                            {formattedDate}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="text-gray-500">موجودی:</span>
                          <span
                            className={cn(
                              "text-emerald-400 font-medium whitespace-nowrap",
                              statusInfo.color === "text-red-400" && "text-gray-400",
                              statusInfo.color === "text-amber-400" && "text-gray-400",
                            )}
                          >
                            {toFarsiNumber(transaction.balanceAfter)} تومان
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;

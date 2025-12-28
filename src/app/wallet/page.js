"use client";

import { toFarsiNumber } from "@/helper/helper";
import { useUser } from "@/store/useUser";
import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Spinner,
} from "@heroui/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import { getData, postData } from "@/services/API";
import { toastConfig } from "@/helper/helper";
import Navbar from "@/components/navbar/Navbar";
import Background from "@/components/chessboard/Background";
import Header from "@/components/header/Header";
import TransactionHistory from "@/components/wallet/TransactionHistory";
import { Icon } from "@iconify/react";

const Wallet = () => {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [balance, setBalance] = useState(user?.balance || 0);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [usdtPriceInToman, setUsdtPriceInToman] = useState(null);
  const [calculatedUsdtAmount, setCalculatedUsdtAmount] = useState(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);

  useEffect(() => {
    // Fetch latest balance
    fetchBalance();
  }, []);

  useEffect(() => {
    // Handle payment status from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");

    if (paymentStatus) {
      if (paymentStatus === "success") {
        toast.success("پرداخت با موفقیت انجام شد", {
          duration: 3000,
          style: toastConfig,
        });
        fetchBalance();
        if (showHistory) {
          fetchTransactions();
        }
        // Clean URL
        router.replace("/wallet");
      } else if (paymentStatus === "cancelled") {
        toast.error("پرداخت لغو شد", {
          duration: 3000,
          style: toastConfig,
        });
        router.replace("/wallet");
      } else if (paymentStatus === "error" || paymentStatus === "failed") {
        toast.error("پرداخت ناموفق بود", {
          duration: 3000,
          style: toastConfig,
        });
        router.replace("/wallet");
      }
    }
  }, [router, showHistory]);

  const fetchBalance = () => {
    // Use cookie authentication (withCredentials is already true in axios config)
    getData("/user/get-info")
      .then((response) => {
        if (response.data?.user) {
          setBalance(response.data.user.balance || 0);
          setUser(response.data.user);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch balance:", error);
      });
  };

  const fetchUsdtPrice = useCallback(() => {
    setIsLoadingPrice(true);
    getData("/wallet/usdt-price")
      .then((response) => {
        if (response.data?.success && response.data?.priceInToman) {
          setUsdtPriceInToman(response.data.priceInToman);
        } else {
          toast.error("خطا در دریافت قیمت USDT", {
            duration: 3000,
            style: toastConfig,
          });
        }
        setIsLoadingPrice(false);
      })
      .catch((error) => {
        console.error("Failed to fetch USDT price:", error);
        toast.error("خطا در دریافت قیمت USDT", {
          duration: 3000,
          style: toastConfig,
        });
        setIsLoadingPrice(false);
      });
  }, []);

  useEffect(() => {
    // Fetch USDT price when deposit modal opens
    if (isDepositModalOpen) {
      fetchUsdtPrice();
    } else {
      setUsdtPriceInToman(null);
      setCalculatedUsdtAmount(null);
    }
  }, [isDepositModalOpen, fetchUsdtPrice]);

  useEffect(() => {
    // Calculate USDT amount when deposit amount changes
    if (depositAmount && usdtPriceInToman) {
      const amount = parseFloat(depositAmount);
      if (!isNaN(amount) && amount > 0) {
        const usdtAmount = amount / usdtPriceInToman;
        setCalculatedUsdtAmount(parseFloat(usdtAmount.toFixed(6)));
      } else {
        setCalculatedUsdtAmount(null);
      }
    } else {
      setCalculatedUsdtAmount(null);
    }
  }, [depositAmount, usdtPriceInToman]);

  const fetchTransactions = () => {
    setIsLoadingTransactions(true);
    // Use cookie authentication (withCredentials is already true in axios config)
    getData("/wallet/transactions")
      .then((response) => {
        if (response.data?.success) {
          setTransactions(response.data.transactions || []);
        }
        setIsLoadingTransactions(false);
      })
      .catch((error) => {
        console.error("Failed to fetch transactions:", error);
        toast.error("خطا در دریافت تاریخچه تراکنش‌ها", {
          duration: 3000,
          style: toastConfig,
        });
        setIsLoadingTransactions(false);
      });
  };

  const handleOpenHistory = () => {
    setShowHistory(true);
    fetchTransactions();
  };

  const handleBackFromHistory = () => {
    setShowHistory(false);
  };

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      toast.error("مبلغ باید بیشتر از صفر باشد", {
        duration: 3000,
        style: toastConfig,
      });
      return;
    }

    setIsLoading(true);
    postData("/wallet/deposit", { amount }, null, null, true)
      .then((response) => {
        if (response.data?.success && response.data?.paymentUrl) {
          // Redirect to Oxapay payment page (test or production mode)
          if (response.data?.isTestMode) {
          toast.success("در حال انتقال به درگاه پرداخت تستی...", {
            duration: 2000,
            style: toastConfig,
          });
          }
          // Redirect to Oxapay payment page
          window.location.href = response.data.paymentUrl;
          // Keep modal open in case user comes back
        } else {
          toast.error(response.data?.message || "خطا در ایجاد درخواست پرداخت", {
            duration: 3000,
            style: toastConfig,
          });
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error("Deposit error:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          (error.response?.status === 401
            ? "احراز هویت ناموفق بود. لطفاً دوباره وارد شوید."
            : "خطا در ایجاد درخواست پرداخت");
        toast.error(errorMessage, {
          duration: 3000,
          style: toastConfig,
        });
        setIsLoading(false);
      });
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error("مبلغ باید بیشتر از صفر باشد", {
        duration: 3000,
        style: toastConfig,
      });
      return;
    }

    const MIN_WITHDRAW_AMOUNT = 100000;
    if (amount < MIN_WITHDRAW_AMOUNT) {
      toast.error(`حداقل مبلغ برداشت ${toFarsiNumber(MIN_WITHDRAW_AMOUNT)} تومان است`, {
        duration: 3000,
        style: toastConfig,
      });
      return;
    }

    setIsLoading(true);
    postData("/wallet/withdraw", { amount })
      .then((response) => {
        console.log("Withdraw response:", response);
        const responseData = response?.data || response;
        
        if (responseData?.success) {
          toast.success(responseData?.message || "برداشت با موفقیت انجام شد", {
            duration: 3000,
            style: toastConfig,
          });
          setBalance(responseData.balance);
          setUser((prev) => ({ ...prev, balance: responseData.balance }));
          setWithdrawAmount("");
          setIsWithdrawModalOpen(false);
          if (showHistory) {
            fetchTransactions();
          }
        } else {
          const errorMsg = responseData?.message || "خطا در برداشت موجودی";
          console.error("Withdraw failed:", errorMsg, responseData);
          toast.error(errorMsg, {
            duration: 3000,
            style: toastConfig,
          });
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Withdraw error:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          (error.response?.status === 401
            ? "احراز هویت ناموفق بود. لطفاً دوباره وارد شوید."
            : "خطا در برداشت موجودی");
        toast.error(errorMessage, {
          duration: 3000,
          style: toastConfig,
        });
        setIsLoading(false);
      });
  };

  return (
    <div className="relative max-w-[450px] flex flex-col items-center gap-5 w-full min-h-screen pb-24 bg-primaryDarkTheme overflow-hidden p-5">
      <Navbar />
      <Background />
      <Toaster />

      {/* Header */}
      <div className="w-full flex flex-col items-center gap-1 mt-2 z-10">
        <h1 className="text-2xl font-black bg-gradient-to-b from-white to-gray-600 bg-clip-text text-transparent">
          کیف پول
        </h1>
        <p className="text-blueColor text-xs mt-0.5">
          مدیریت موجودی و شارژ کیف پول
        </p>
      </div>

      {/* Balance Card */}
      <div className="w-full z-10">
        <div className="relative w-full rounded-3xl p-[1px] bg-gradient-to-b from-emerald-400/50 via-emerald-400/20 to-transparent">
          <div className="relative flex flex-col items-center gap-5 rounded-3xl bg-secondaryDarkTheme/95 backdrop-blur-xl p-6">
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-400/5 blur-3xl" />
              <div className="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-blueColor/5 blur-3xl" />
            </div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-sm text-gray-400">موجودی شما</span>
              <div className="flex items-center gap-2">
                <span className="text-4xl font-black text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                  {toFarsiNumber(balance || 0)}
                </span>
                <span className="text-lg text-gray-400">تومان</span>
              </div>
            </div>

            <div className="grid grid-cols-2 w-full gap-3 mt-2">
              <button
                onClick={() => setIsDepositModalOpen(true)}
                className="h-14 rounded-2xl bg-gradient-to-r from-blueColor/20 to-blueColor/30 text-white text-xs font-semibold flex flex-col items-center justify-center gap-1.5 border border-blueColor/30 hover:border-blueColor/50 transition-all"
              >
                <Icon
                  icon="solar:card-send-linear"
                  width={20}
                  height={20}
                  className="text-blueColor rotate-180"
                />
                <span className="text-[10px]">افزایش</span>
              </button>

              <button
                onClick={() => setIsWithdrawModalOpen(true)}
                className="h-14 rounded-2xl bg-gradient-to-r from-amber-400/20 to-orange-500/25 text-white text-xs font-semibold flex flex-col items-center justify-center gap-1.5 border border-amber-400/30 hover:border-amber-400/50 transition-all"
              >
                <Icon
                  icon="solar:card-send-linear"
                  width={20}
                  height={20}
                  className="text-amber-400"
                />
                <span className="text-[10px]">برداشت</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {!showHistory ? (
        <>
          {/* Action Cards */}
          <div className="w-full flex flex-col gap-3 z-10">
            {/* Deposit Card */}
            <div className="relative w-full rounded-3xl p-[1px] bg-gradient-to-b from-blueColor/30 via-blueColor/10 to-transparent">
              <div className="relative flex items-center justify-between rounded-3xl bg-secondaryDarkTheme/95 backdrop-blur-xl p-4">
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl">
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blueColor/5 blur-3xl" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-2xl bg-blueColor/10 border border-blueColor/30 flex items-center justify-center">
                    <Icon
                      icon="solar:card-send-bold"
                      width={22}
                      height={22}
                      className="text-blueColor rotate-180"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                      افزایش موجودی
                    </span>
                    <span className="text-xs text-gray-400">شارژ کیف پول</span>
                  </div>
                </div>
                <Button
                  onClick={() => setIsDepositModalOpen(true)}
                  className="bg-blueColor/10 border border-blueColor/30 text-blueColor hover:bg-blueColor/20 text-xs font-medium px-4 h-9"
                >
                  افزایش
                </Button>
              </div>
            </div>

            {/* Withdraw Card */}
            <div className="relative w-full rounded-3xl p-[1px] bg-gradient-to-b from-amber-400/30 via-orange-500/15 to-transparent">
              <div className="relative flex items-center justify-between rounded-3xl bg-secondaryDarkTheme/95 backdrop-blur-xl p-4">
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl">
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-400/5 blur-3xl" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center">
                    <Icon
                      icon="solar:card-send-bold"
                      width={22}
                      height={22}
                      className="text-amber-400"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                      برداشت موجودی
                    </span>
                    <span className="text-xs text-gray-400">
                      درخواست برداشت
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => setIsWithdrawModalOpen(true)}
                  className="bg-amber-400/10 border border-amber-400/30 text-amber-400 hover:bg-amber-400/20 text-xs font-medium px-4 h-9"
                >
                  برداشت
                </Button>
              </div>
            </div>
          </div>

          {/* History Button */}
          <div className="w-full z-10">
            <button
              onClick={handleOpenHistory}
              className="relative w-full rounded-3xl p-[1px] bg-gradient-to-b from-purple-500/40 via-purple-500/20 to-transparent"
            >
              <div className="relative flex items-center justify-center gap-3 rounded-3xl bg-secondaryDarkTheme/95 backdrop-blur-xl p-4">
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl">
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-500/5 blur-3xl" />
                  <div className="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-blueColor/5 blur-3xl" />
                </div>
                <Icon
                  icon="solar:history-bold"
                  width={22}
                  height={22}
                  className="text-purple-400"
                />
                <span className="text-sm font-semibold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                  تاریخچه تراکنش‌ها
                </span>
              </div>
            </button>
          </div>
        </>
      ) : (
        <TransactionHistory
          transactions={transactions}
          isLoading={isLoadingTransactions}
          onBack={handleBackFromHistory}
        />
      )}

      {/* Deposit Modal */}
      <Modal
        isOpen={isDepositModalOpen}
        onClose={() => {
          setIsDepositModalOpen(false);
          setDepositAmount("");
        }}
        size="md"
        classNames={{
          base: "bg-primaryDarkTheme",
          backdrop: "bg-black/70 backdrop-blur-sm",
          header: "border-b border-white/5",
          body: "py-6",
        }}
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-lg font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                  افزایش موجودی
                </h2>
                <p className="text-xs text-gray-400 font-normal">
                  مبلغ مورد نظر برای شارژ کیف پول را وارد کنید. پس از تأیید به
                  درگاه پرداخت Oxapay هدایت خواهید شد.
                </p>
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  {/* Current Balance Display */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-secondaryDarkTheme/50 border border-white/10">
                    <span className="text-sm text-gray-400">موجودی فعلی:</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {toFarsiNumber(balance || 0)} تومان
                    </span>
                  </div>

                  <Input
                    label="مبلغ (تومان)"
                    placeholder="مبلغ را وارد کنید"
                    type="number"
                    min="1000"
                    variant="bordered"
                    labelPlacement="outside"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    classNames={{
                      label: "!text-gray-200 -bottom-0 text-sm font-medium",
                      input: "placeholder:text-xs text-white",
                      inputWrapper:
                        "!bg-primaryDarkTheme/50 focus-within:!border-blueColor !shadow-none !border border-white/10 hover:border-white/20 transition-colors",
                    }}
                  />

                  {/* USDT Price Display */}
                  {isLoadingPrice ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-secondaryDarkTheme/50 border border-white/10">
                      <span className="text-sm text-gray-400">در حال دریافت قیمت...</span>
                      <Spinner size="sm" />
                    </div>
                  ) : usdtPriceInToman ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-secondaryDarkTheme/50 border border-white/10">
                      <span className="text-sm text-gray-400">قیمت هر USDT:</span>
                      <span className="text-sm font-semibold text-blueColor">
                        {toFarsiNumber(usdtPriceInToman)} تومان
                      </span>
                    </div>
                  ) : null}

                  {/* Calculated USDT Amount Display */}
                  {calculatedUsdtAmount && depositAmount && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blueColor/10 to-blueColor/5 border border-blueColor/30">
                      <span className="text-sm text-gray-300">مبلغ قابل پرداخت:</span>
                      <span className="text-lg font-bold text-blueColor">
                        {toFarsiNumber(calculatedUsdtAmount.toFixed(6))} USDT
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      onClick={onClose}
                      disabled={isLoading}
                      className="flex-1 bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10 transition-colors"
                    >
                      انصراف
                    </Button>
                    <Button
                      onClick={handleDeposit}
                      isLoading={isLoading}
                      disabled={isLoading}
                      className="flex-1 !bg-blueColor text-white !shadow-none hover:!bg-blueColor/90 transition-all font-semibold"
                    >
                      انتقال به درگاه پرداخت
                    </Button>
                  </div>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => {
          setIsWithdrawModalOpen(false);
          setWithdrawAmount("");
        }}
        size="md"
        classNames={{
          base: "bg-primaryDarkTheme",
          backdrop: "bg-black/70 backdrop-blur-sm",
          header: "border-b border-white/5",
          body: "py-6",
        }}
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-lg font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                  برداشت موجودی
                </h2>
                <p className="text-xs text-gray-400 font-normal">
                  مبلغ برداشت را وارد کنید. (برداشت در صورت کافی بودن موجودی
                  انجام می‌شود)
                </p>
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  {/* Current Balance Display */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-secondaryDarkTheme/50 border border-white/10">
                    <span className="text-sm text-gray-400">موجودی فعلی:</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {toFarsiNumber(balance || 0)} تومان
                    </span>
                  </div>

                  <Input
                    label="مبلغ (تومان)"
                    placeholder="حداقل 100,000 تومان"
                    type="number"
                    min="100000"
                    variant="bordered"
                    labelPlacement="outside"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    classNames={{
                      label: "!text-gray-200 -bottom-0 text-sm font-medium",
                      input: "placeholder:text-xs text-white",
                      inputWrapper:
                        "!bg-primaryDarkTheme/50 focus-within:!border-blueColor !shadow-none !border border-white/10 hover:border-white/20 transition-colors",
                    }}
                  />

                  {/* Info about weekly withdrawal process */}
                  <div className="p-3 rounded-xl bg-blueColor/5 border border-blueColor/20">
                    <div className="flex items-start gap-2">
                      <Icon
                        icon="solar:calendar-mark-linear"
                        width={16}
                        height={16}
                        className="text-blueColor mt-0.5 flex-shrink-0"
                      />
                      <div className="flex flex-col gap-1">
                        <p className="text-xs text-blueColor font-semibold">
                          زمان پردازش برداشت:
                        </p>
                        <p className="text-[11px] text-gray-400 leading-relaxed">
                          درخواست‌های برداشت به صورت هفتگی پردازش می‌شوند. حساب‌کتاب‌ها در آخر هفته انجام شده و مبلغ به حساب شما واریز می‌شود.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Warning if amount exceeds balance or is less than minimum */}
                  {withdrawAmount && (
                    <>
                      {parseFloat(withdrawAmount) < 100000 && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                          <p className="text-xs text-amber-400">
                            حداقل مبلغ برداشت {toFarsiNumber(100000)} تومان است.
                          </p>
                        </div>
                      )}
                      {parseFloat(withdrawAmount) > (balance || 0) && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                          <p className="text-xs text-red-400">
                            موجودی کافی نیست. موجودی شما{" "}
                            {toFarsiNumber(balance || 0)} تومان است.
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      onClick={onClose}
                      disabled={isLoading}
                      className="flex-1 bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10 transition-colors"
                    >
                      انصراف
                    </Button>
                    <Button
                      onClick={handleWithdraw}
                      isLoading={isLoading}
                      disabled={
                        isLoading ||
                        (withdrawAmount &&
                          (parseFloat(withdrawAmount) > (balance || 0) ||
                            parseFloat(withdrawAmount) < 100000))
                      }
                      className="flex-1 !bg-amber-500 text-white !shadow-none hover:!bg-amber-500/90 transition-all font-semibold disabled:opacity-50"
                    >
                      درخواست برداشت
                    </Button>
                  </div>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Wallet;

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@heroui/react";
import Background from "@/components/chessboard/Background";

export default function PaymentCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("در حال بررسی وضعیت پرداخت...");
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;

  useEffect(() => {
    const verifyPayment = async () => {
      const orderId = searchParams.get("orderId");
      const trackId = searchParams.get("trackId");
      const statusParam = searchParams.get("status");

      if (!orderId) {
        setStatus("error");
        return;
      }

      try {
        const verifyUrl = `/api/wallet/verify-payment?orderId=${orderId}${trackId ? `&trackId=${trackId}` : ""}${statusParam ? `&status=${statusParam}` : ""}`;
        const response = await fetch(verifyUrl);
        const data = await response.json();

        if (data.success) {
          setStatus("success");
          setMessage("پرداخت با موفقیت انجام شد. در حال انتقال...");
          setTimeout(() => {
            router.replace("/wallet?payment=success");
          }, 1500);
        } else if (data.pending) {
          // Retry verification if still processing
          if (retryCount < maxRetries) {
            setRetryCount(prev => prev + 1);
            setStatus("verifying");
            setMessage(`در حال بررسی وضعیت پرداخت... (${retryCount + 1}/${maxRetries})`);
            
            setTimeout(() => {
              verifyPayment();
            }, 2000);
          } else {
            setStatus("error");
            setMessage("زمان بررسی پرداخت به پایان رسید. لطفاً به کیف پول برگردید و وضعیت را بررسی کنید");
            setTimeout(() => {
              router.replace("/wallet");
            }, 3000);
          }
        } else {
          setStatus("failed");
          setMessage(data.message || "پرداخت انجام نشد");
          setTimeout(() => {
            router.replace("/wallet?payment=failed");
          }, 2000);
        }
      } catch (error) {
        setStatus("error");
        setMessage("خطا در بررسی وضعیت پرداخت");
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="relative max-w-[450px] flex flex-col items-center justify-center gap-5 w-full min-h-screen pb-24 bg-primaryDarkTheme overflow-hidden p-5">
      <Background />
      <div className="relative z-10 flex flex-col items-center gap-4 bg-secondaryDarkTheme/95 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
        {status === "verifying" && (
          <>
            <Spinner size="lg" color="primary" />
            <p className="text-white text-center">{message}</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="size-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
                className="size-8 text-emerald-400"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-emerald-400 text-center font-semibold">{message}</p>
          </>
        )}
        {(status === "failed" || status === "error") && (
          <>
            <div className="size-16 rounded-full bg-red-500/20 border-2 border-red-400 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
                className="size-8 text-red-400"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-400 text-center font-semibold">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}


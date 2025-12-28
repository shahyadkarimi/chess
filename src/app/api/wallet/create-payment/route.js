import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import jwt from "jsonwebtoken";

const PAYMENT_GATEWAY_MODE = process.env.PAYMENT_GATEWAY_MODE || "development";
const OXAPAY_MERCHANT_KEY = process.env.OXAPAY_MERCHANT_KEY;
const OXAPAY_INVOICE_URL = process.env.OXAPAY_API_URL || "https://api.oxapay.com/v1/payment/invoice";
const NOBITEX_API_URL = "https://apiv2.nobitex.ir/v3/orderbook/USDTIRT";

export async function POST(req) {
  try {
    await connectDB();
    const token =
      req.cookies.get("token")?.value ||
      req.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ message: "توکن یافت نشد" }, { status: 401 });
    }

    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ message: "توکن نامعتبر است" }, { status: 401 });
    }

    const body = await req.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ message: "مبلغ باید بیشتر از صفر باشد" }, { status: 400 });
    }

    // Fetch USDT price from Nobitex
    let usdtPriceInToman;
    try {
      const nobitexResponse = await fetch(NOBITEX_API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!nobitexResponse.ok) {
        throw new Error(`Nobitex API error: ${nobitexResponse.status}`);
      }

      const nobitexData = await nobitexResponse.json();

      if (nobitexData.status !== "ok" || !nobitexData.lastTradePrice) {
        throw new Error("Invalid response from Nobitex");
      }

      // Convert price from Rial to Toman (divide by 10)
      const priceInRial = parseFloat(nobitexData.lastTradePrice);
      usdtPriceInToman = priceInRial / 10;
    } catch (error) {
      console.error("Error fetching USDT price:", error);
      return NextResponse.json(
        { message: "خطا در دریافت قیمت USDT. لطفاً دوباره تلاش کنید." },
        { status: 500 }
      );
    }

    // Calculate USDT amount: TomanAmount / PriceInToman
    const amountInUSDT = parseFloat((amount / usdtPriceInToman).toFixed(6));
    
    if (amountInUSDT < 0.01) {
      return NextResponse.json({ message: "مبلغ باید حداقل معادل 0.01 USDT باشد" }, { status: 400 });
    }

    // Use USDT amount for Oxapay (they accept USD/USDT)
    const amountInUSD = amountInUSDT;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "کاربر یافت نشد" }, { status: 404 });
    }

    const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const callbackUrl = `${origin}/api/wallet/payment-callback`;
    const returnUrl = `${origin}/payment-callback?orderId=${paymentId}`;
    const cancelUrl = `${origin}/payment-callback?orderId=${paymentId}`;

    const oxapayPayload = {
      amount: amountInUSD,
      currency: "USD",
      to_currency: "USDT",
      callback_url: callbackUrl,
      return_url: returnUrl,
      order_id: paymentId,
      email: user.phoneNumber + "@example.com",
      description: `شارژ کیف پول - کاربر: ${user.userName}`,
      ...(PAYMENT_GATEWAY_MODE === "development" && { sandbox: true }),
    };

    const transaction = await Transaction.create({
      userId: user._id,
      type: "deposit",
      amount: amount,
      description: `افزایش موجودی به مبلغ ${amount} تومان - در انتظار پرداخت${PAYMENT_GATEWAY_MODE === "development" ? " (حالت تست)" : ""}`,
      balanceAfter: user.balance || 0,
      paymentId: paymentId,
      paymentStatus: "pending",
      gateway: "oxapay",
    });

    try {
      const oxapayResponse = await fetch(OXAPAY_INVOICE_URL, {
        method: "POST",
        headers: {
          "merchant_api_key": OXAPAY_MERCHANT_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(oxapayPayload),
      });

      const oxapayData = await oxapayResponse.json();

      // Response format: { status: 200, data: { track_id, payment_url }, message }
      if (oxapayData.status === 200 && oxapayData.data?.payment_url) {
        transaction.gatewayTransactionId = oxapayData.data.track_id;
        await transaction.save();

        return NextResponse.json({
          success: true,
          paymentUrl: oxapayData.data.payment_url,
          paymentId: paymentId,
          trackId: oxapayData.data.track_id,
          amountInUSDT: amountInUSDT,
          usdtPriceInToman: parseFloat(usdtPriceInToman.toFixed(2)),
          message: PAYMENT_GATEWAY_MODE === "development" 
            ? "لینک پرداخت تستی ایجاد شد" 
            : "لینک پرداخت ایجاد شد",
          isTestMode: PAYMENT_GATEWAY_MODE === "development",
        });
      } else {
        transaction.paymentStatus = "failed";
        await transaction.save();

        return NextResponse.json(
          {
            success: false,
            message: oxapayData.message || "خطا در ایجاد درخواست پرداخت",
          },
          { status: 400 }
        );
      }
    } catch (error) {
      transaction.paymentStatus = "failed";
      await transaction.save();

      return NextResponse.json(
        { success: false, message: "خطا در ارتباط با درگاه پرداخت" },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json({ message: "خطا در ایجاد پرداخت" }, { status: 500 });
  }
}


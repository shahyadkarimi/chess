import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

const OXAPAY_MERCHANT_KEY = process.env.OXAPAY_MERCHANT_KEY;
const OXAPAY_PAYMENT_INFO_URL = process.env.OXAPAY_PAYMENT_INFO_URL || "https://api.oxapay.com/v1/payment";

/**
 * Verify payment status using Oxapay Payment Information API
 * Uses trackId to check payment status and update user balance if successful
 */
export async function GET(req) {
  try {
    await connectDB();
    
    const searchParams = req.nextUrl.searchParams;
    const orderId = searchParams.get("orderId");
    const trackId = searchParams.get("trackId");
    const statusParam = searchParams.get("status");

    if (!orderId) {
      return NextResponse.json({
        success: false,
        message: "اطلاعات پرداخت نامعتبر است",
      }, { status: 400 });
    }

    // Find transaction by payment ID
    let transaction = await Transaction.findOne({
      paymentId: orderId,
      gateway: "oxapay",
    });

    if (!transaction) {
      transaction = await Transaction.findOne({ paymentId: orderId });
    }

    if (!transaction) {
      return NextResponse.json({
        success: false,
        message: "تراکنش یافت نشد",
      }, { status: 404 });
    }

    // Return success if already completed
    if (transaction.paymentStatus === "completed") {
      const user = await User.findById(transaction.userId);
      return NextResponse.json({
        success: true,
        message: "پرداخت قبلاً تأیید شده است",
        balance: user?.balance || 0,
      });
    }

    // Get trackId from URL or transaction (saved when payment was created)
    const actualTrackId = trackId || transaction.gatewayTransactionId;

    if (!actualTrackId) {
      if (transaction.paymentStatus === "pending") {
        return NextResponse.json({
          success: false,
          message: "در حال پردازش پرداخت... لطفاً چند لحظه صبر کنید",
          pending: true,
          orderId: orderId,
        });
      }
      return NextResponse.json({
        success: false,
        message: transaction.paymentStatus === "cancelled" ? "پرداخت لغو شد" : "پرداخت انجام نشد",
      });
    }

    // Verify payment status with Oxapay Payment Information API
    try {
      const paymentInfoUrl = `${OXAPAY_PAYMENT_INFO_URL}/${actualTrackId}`;

      const paymentInfoResponse = await fetch(paymentInfoUrl, {
        method: "GET",
        headers: {
          "merchant_api_key": OXAPAY_MERCHANT_KEY,
          "Content-Type": "application/json",
        },
      });

      if (!paymentInfoResponse.ok) {
        if (transaction.paymentStatus === "pending") {
          return NextResponse.json({
            success: false,
            message: "در حال پردازش پرداخت... لطفاً چند لحظه صبر کنید",
            pending: true,
            orderId: orderId,
          });
        }
        return NextResponse.json({
          success: false,
          message: "خطا در بررسی وضعیت پرداخت از درگاه",
        });
      }

      const paymentInfoData = await paymentInfoResponse.json();
      const paymentStatus = paymentInfoData?.data?.status;
      const isPaymentSuccessful = paymentStatus === "paid";

      if (isPaymentSuccessful) {
        // Payment successful - update balance and transaction
        const user = await User.findById(transaction.userId);
        if (!user) {
          return NextResponse.json({
            success: false,
            message: "کاربر یافت نشد",
          }, { status: 404 });
        }

        user.balance = (user.balance || 0) + transaction.amount;
        await user.save();

        transaction.paymentStatus = "completed";
        transaction.gatewayTransactionId = actualTrackId;
        transaction.balanceAfter = user.balance;
        transaction.description = `افزایش موجودی به مبلغ ${transaction.amount} تومان - پرداخت موفق`;
        await transaction.save();

        return NextResponse.json({
          success: true,
          message: "پرداخت با موفقیت انجام شد",
          balance: user.balance,
        });
      } else {
        // Update transaction status based on Oxapay response
        if (paymentStatus === "expired" || paymentStatus === "cancelled") {
          transaction.paymentStatus = "cancelled";
          transaction.description = `افزایش موجودی به مبلغ ${transaction.amount} تومان - پرداخت لغو شد`;
        } else if (paymentStatus === "failed") {
          transaction.paymentStatus = "failed";
          transaction.description = `افزایش موجودی به مبلغ ${transaction.amount} تومان - پرداخت ناموفق`;
        }
        await transaction.save();

        return NextResponse.json({
          success: false,
          message: transaction.paymentStatus === "cancelled" 
            ? "پرداخت لغو شد" 
            : transaction.paymentStatus === "failed"
            ? "پرداخت ناموفق بود"
            : "در حال پردازش پرداخت... لطفاً چند لحظه صبر کنید",
          pending: transaction.paymentStatus === "pending",
          orderId: orderId,
        });
      }
    } catch (error) {
      if (transaction.paymentStatus === "pending") {
        return NextResponse.json({
          success: false,
          message: "در حال پردازش پرداخت... لطفاً چند لحظه صبر کنید",
          pending: true,
          orderId: orderId,
        });
      }
      
      return NextResponse.json({
        success: false,
        message: "خطا در بررسی وضعیت پرداخت",
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "خطا در بررسی وضعیت پرداخت",
    }, { status: 500 });
  }
}


import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

/**
 * POST callback from Oxapay webhook
 * Processes payment status updates from Oxapay
 */
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { trackId, orderId, status } = body;

    if (!trackId || !orderId) {
      return NextResponse.json({ message: "اطلاعات پرداخت نامعتبر است" }, { status: 400 });
    }

    const transaction = await Transaction.findOne({
      paymentId: orderId,
      gateway: "oxapay",
    });

    if (!transaction) {
      return NextResponse.json({ message: "تراکنش یافت نشد" }, { status: 404 });
    }

    // Save trackId if not already saved
    if (trackId && !transaction.gatewayTransactionId) {
      transaction.gatewayTransactionId = trackId;
    }

    if (transaction.paymentStatus === "completed") {
      return NextResponse.json({ 
        success: true,
        message: "تراکنش قبلاً پرداخت شده است" 
      }, { status: 200 });
    }

    // Process payment status from Oxapay callback
    // Status: 1 or 2 = paid, 3 = cancelled, other = failed
    const statusNumber = parseInt(status);
    const isPaymentSuccessful = statusNumber === 1 || statusNumber === 2 || status === "paid" || status === "success";

    if (isPaymentSuccessful) {
      const user = await User.findById(transaction.userId);
      if (!user) {
        return NextResponse.json({ message: "کاربر یافت نشد" }, { status: 404 });
      }

      user.balance = (user.balance || 0) + transaction.amount;
      await user.save();

      transaction.paymentStatus = "completed";
      transaction.gatewayTransactionId = trackId;
      transaction.balanceAfter = user.balance;
      transaction.description = `افزایش موجودی به مبلغ ${transaction.amount} تومان - پرداخت موفق`;
      await transaction.save();

      return NextResponse.json({
        success: true,
        message: "پرداخت با موفقیت انجام شد",
      });
    } else if (statusNumber === 3 || status === "cancelled") {
      transaction.paymentStatus = "cancelled";
      transaction.gatewayTransactionId = trackId;
      transaction.description = `افزایش موجودی به مبلغ ${transaction.amount} تومان - پرداخت لغو شد`;
      await transaction.save();

      return NextResponse.json({
        success: false,
        message: "پرداخت لغو شد",
      });
    } else {
      transaction.paymentStatus = "failed";
      transaction.gatewayTransactionId = trackId;
      transaction.description = `افزایش موجودی به مبلغ ${transaction.amount} تومان - پرداخت ناموفق`;
      await transaction.save();

      return NextResponse.json({
        success: false,
        message: "پرداخت ناموفق بود",
      });
    }
  } catch (error) {
    return NextResponse.json({ message: "خطا در پردازش پرداخت" }, { status: 500 });
  }
}

/**
 * GET callback for return URLs from Oxapay
 * Redirects to frontend payment callback page for verification
 * Also processes status from URL if transaction is pending (fallback for localhost)
 */
export async function GET(req) {
  try {
    await connectDB();
    
    const searchParams = req.nextUrl.searchParams;
    const orderId = searchParams.get("orderId");
    const trackId = searchParams.get("trackId");
    const status = searchParams.get("status");

    if (!orderId) {
      return NextResponse.redirect(new URL("/payment-callback?orderId=error", req.url));
    }

    const transaction = await Transaction.findOne({
      paymentId: orderId,
      gateway: "oxapay",
    });

    if (!transaction) {
      return NextResponse.redirect(new URL("/payment-callback?orderId=error", req.url));
    }

    const actualTrackId = trackId || transaction.gatewayTransactionId;

    // Process status from URL if transaction is pending (fallback for localhost where POST callback may not reach)
    if (status && transaction.paymentStatus === "pending") {
      const statusNumber = parseInt(status);
      const isPaymentSuccessful = statusNumber === 1 || statusNumber === 2 || status === "paid" || status === "success";

      if (isPaymentSuccessful) {
        const user = await User.findById(transaction.userId);
        if (user) {
          user.balance = (user.balance || 0) + transaction.amount;
          await user.save();

          transaction.paymentStatus = "completed";
          if (actualTrackId) {
            transaction.gatewayTransactionId = actualTrackId;
          }
          transaction.balanceAfter = user.balance;
          transaction.description = `افزایش موجودی به مبلغ ${transaction.amount} تومان - پرداخت موفق`;
          await transaction.save();
        }
      } else if (statusNumber === 3 || status === "cancelled") {
        transaction.paymentStatus = "cancelled";
        if (actualTrackId) {
          transaction.gatewayTransactionId = actualTrackId;
        }
        transaction.description = `افزایش موجودی به مبلغ ${transaction.amount} تومان - پرداخت لغو شد`;
        await transaction.save();
      } else {
        transaction.paymentStatus = "failed";
        if (actualTrackId) {
          transaction.gatewayTransactionId = actualTrackId;
        }
        transaction.description = `افزایش موجودی به مبلغ ${transaction.amount} تومان - پرداخت ناموفق`;
        await transaction.save();
      }
    }

    return NextResponse.redirect(new URL(`/payment-callback?orderId=${orderId}${actualTrackId ? `&trackId=${actualTrackId}` : ""}${status ? `&status=${status}` : ""}`, req.url));
  } catch (error) {
    return NextResponse.redirect(new URL("/wallet?payment=error", req.url));
  }
}


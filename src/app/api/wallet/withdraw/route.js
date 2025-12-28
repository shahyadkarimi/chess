import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await connectDB();
    // Get token from cookie or authorization header
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

    const MIN_WITHDRAW_AMOUNT = 100000;
    if (amount < MIN_WITHDRAW_AMOUNT) {
      return NextResponse.json(
        { message: `حداقل مبلغ برداشت ${MIN_WITHDRAW_AMOUNT.toLocaleString()} تومان است` },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "کاربر یافت نشد" }, { status: 404 });
    }

    if ((user.balance || 0) < amount) {
      return NextResponse.json({ message: "موجودی کافی نیست" }, { status: 400 });
    }

    user.balance -= amount;
    await user.save();

    // Create transaction record
    await Transaction.create({
      userId: user._id,
      type: "withdraw",
      amount: amount,
      description: `برداشت موجودی به مبلغ ${amount} تومان`,
      balanceAfter: user.balance,
    });

    return NextResponse.json({
      success: true,
      message: "برداشت با موفقیت انجام شد",
      balance: user.balance,
    });
  } catch (error) {
    console.error("Error in withdraw:", error);
    return NextResponse.json({ message: "خطا در برداشت موجودی" }, { status: 500 });
  }
}

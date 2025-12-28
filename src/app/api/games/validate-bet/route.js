import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await connectDB();
    const token = req.headers.get("authorization")?.split(" ")[1];

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
    const { betAmount } = body;

    if (betAmount === undefined || betAmount === null) {
      return NextResponse.json({ message: "مبلغ شرط الزامی است" }, { status: 400 });
    }

    if (betAmount === 0) {
      return NextResponse.json({ 
        valid: true, 
        message: "بازی رایگان" 
      }, { status: 200 });
    }

    if (betAmount < 0) {
      return NextResponse.json({ message: "مبلغ شرط نمی‌تواند منفی باشد" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "کاربر یافت نشد" }, { status: 404 });
    }

    const currentBalance = user.balance || 0;

    if (currentBalance < betAmount) {
      return NextResponse.json({
        valid: false,
        message: "موجودی کافی نیست",
        balance: currentBalance,
        required: betAmount,
        shortage: betAmount - currentBalance,
      }, { status: 200 });
    }

    return NextResponse.json({
      valid: true,
      message: "موجودی کافی است",
      balance: currentBalance,
    }, { status: 200 });
  } catch (error) {
    console.error("Error in validate-bet:", error);
    return NextResponse.json({ message: "خطا در بررسی موجودی" }, { status: 500 });
  }
}











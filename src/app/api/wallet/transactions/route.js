import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    await connectDB();
    // Get token from cookie or authorization header
    const authHeader = req.headers.get("authorization");
    const token =
      req.cookies.get("token")?.value ||
      (authHeader && authHeader.split(" ")[1]);

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

    const transactions = await Transaction.find({ userId })
      .populate("relatedUserId", "userName nickName")
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error("Error in get transactions:", error);
    return NextResponse.json(
      { message: "خطا در دریافت تاریخچه تراکنش‌ها" },
      { status: 500 }
    );
  }
}


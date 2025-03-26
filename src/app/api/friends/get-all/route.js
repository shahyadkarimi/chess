import connectDB from "@/lib/db";
import Friendship from "@/models/Friendship";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();

    // get user token
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "توکن یافت نشد.",},
        { status: 401 }
      );
    }
    // get user id by token
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (err) {
      return NextResponse.json({ error: "توکن نامعتبر است." }, { status: 401 });
    }

    // پیدا کردن دوستانی که این کاربر در آن‌ها حضور دارد
    const friends = await Friendship.find({
      $or: [{ user1: userId }, { user2: userId }],
    }).populate("user1 user2", "name nickName");

    // فرمت خروجی
    const friendsList = friends.map((friend) => {
      return friend.user1._id.toString() === userId
        ? friend.user2
        : friend.user1;
    });

    return NextResponse.json(
      { message: "درخواست با موفقیت انجام شد", friendsList },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "مشکلی رخ داده است." }, { status: 500 });
  }
}

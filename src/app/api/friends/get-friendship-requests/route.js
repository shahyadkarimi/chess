import connectDB from "@/lib/db";

export async function GET(req) {
  try {
    await connectDB();

    // get user token
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "توکن یافت نشد." }, { status: 401 });
    }

    // get user id by token
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (err) {
      return NextResponse.json({ error: "توکن نامعتبر است." }, { status: 401 });
    }

    // get requests with pending status
    const requests = await FriendRequest.find({
      receiver: userId,
      status: "pending",
    }).populate("sender", "name nickName");

    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json({ error: "مشکلی رخ داده است." }, { status: 500 });
  }
}

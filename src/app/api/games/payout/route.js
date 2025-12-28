import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import { calculateRank } from "@/helper/helper";

export async function POST(req) {
  try {
    await connectDB();
    const { roomId, winnerId, loserId, betAmount, gameType } = await req.json();

    if (!roomId || !winnerId || !loserId) {
      return NextResponse.json(
        { error: "roomId, winnerId, and loserId are required" },
        { status: 400 }
      );
    }

    // Only process payout if betAmount > 0
    if (!betAmount || betAmount <= 0) {
      return NextResponse.json(
        { success: true, message: "Free game, no payout needed" },
        { status: 200 }
      );
    }

    const winner = await User.findById(winnerId);
    const loser = await User.findById(loserId);

    if (!winner || !loser) {
      return NextResponse.json(
        { error: "Winner or loser not found" },
        { status: 404 }
      );
    }

    // Winner receives betAmount * 2 (their bet + opponent's bet)
    const winnings = betAmount * 2;
    winner.balance = (winner.balance || 0) + winnings;
    
    // Update ranking for winner
    winner.wins = (winner.wins || 0) + 1;
    winner.totalScore = (winner.totalScore || 0) + 20;
    winner.rank = calculateRank(winner.totalScore);
    
    // Update ranking for loser
    loser.losses = (loser.losses || 0) + 1;
    loser.totalScore = Math.max(0, (loser.totalScore || 0) - 5);
    loser.rank = calculateRank(loser.totalScore);
    
    await winner.save();
    await loser.save();

    // Create transaction for winner
    await Transaction.create({
      userId: winner._id,
      type: "game_win",
      amount: winnings,
      description: `برنده بازی ${gameType === "tictactoe" ? "دوز" : gameType === "chess" ? "شطرنج" : "سنگ کاغذ قیچی"}: ${winnings} تومان`,
      relatedUserId: loser._id,
      balanceAfter: winner.balance,
    });

    // Create transaction for loser (already deducted, just record the loss)
    await Transaction.create({
      userId: loser._id,
      type: "game_loss",
      amount: -betAmount,
      description: `بازنده بازی ${gameType === "tictactoe" ? "دوز" : gameType === "chess" ? "شطرنج" : "سنگ کاغذ قیچی"}: ${betAmount} تومان`,
      relatedUserId: winner._id,
      balanceAfter: loser.balance || 0,
    });

    return NextResponse.json({
      success: true,
      message: "Payout processed successfully",
      winnerBalance: winner.balance,
    }, { status: 200 });
  } catch (error) {
    console.error("Error in payout:", error);
    return NextResponse.json(
      { error: "خطا در پرداخت جایزه" },
      { status: 500 }
    );
  }
}




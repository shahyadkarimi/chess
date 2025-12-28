import { NextResponse } from "next/server";

const NOBITEX_API_URL = "https://apiv2.nobitex.ir/v3/orderbook/USDTIRT";

/**
 * GET /api/wallet/usdt-price
 * دریافت قیمت لحظه‌ای USDT از Nobitex
 * قیمت به تومان برگردانده می‌شود (قیمت ریالی تقسیم بر 10)
 */
export async function GET() {
  try {
    const response = await fetch(NOBITEX_API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 30 }, // Cache for 30 seconds
    });

    if (!response.ok) {
      throw new Error(`Nobitex API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== "ok" || !data.lastTradePrice) {
      return NextResponse.json(
        { success: false, message: "خطا در دریافت قیمت از Nobitex" },
        { status: 500 }
      );
    }

    // Convert price from Rial to Toman (divide by 10)
    const priceInRial = parseFloat(data.lastTradePrice);
    const priceInToman = priceInRial / 10;

    // Also get ask price (first sell order) as alternative
    const askPriceInRial = data.asks && data.asks.length > 0 
      ? parseFloat(data.asks[0][0]) 
      : null;
    const askPriceInToman = askPriceInRial ? askPriceInRial / 10 : null;

    return NextResponse.json({
      success: true,
      priceInToman: parseFloat(priceInToman.toFixed(2)),
      priceInRial: priceInRial,
      askPriceInToman: askPriceInToman ? parseFloat(askPriceInToman.toFixed(2)) : null,
      lastUpdate: data.lastUpdate,
    });
  } catch (error) {
    console.error("Error fetching USDT price:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "خطا در دریافت قیمت USDT",
        error: error.message 
      },
      { status: 500 }
    );
  }
}


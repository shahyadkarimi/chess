const idGenerator = () => Math.random().toString(36).substring(2, 8);

const toFarsiNumber = (num) => {
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  if (num) {
    return num
      .toLocaleString()
      .toString()
      .replace(/\d/g, (x) => farsiDigits[x]);
  } else {
    return (0)
      .toLocaleString()
      .toString()
      .replace(/\d/g, (x) => farsiDigits[x]);
  }
};

const getGreeting = () => {
  const hour = new Date().getHours(); // گرفتن ساعت فعلی سیستم

  if (hour >= 5 && hour < 12) {
    return "صبح بخیر! ☀️";
  } else if (hour >= 12 && hour < 17) {
    return "ظهر بخیر! 🌤️";
  } else if (hour >= 17 && hour < 21) {
    return "عصر بخیر! 🌇";
  } else {
    return "شب بخیر! 🌙";
  }
};

const getSquareColor = (square) => {

  const file = square.charAt(0);
  const rank = square.charAt(1);


  const fileNumber = file.charCodeAt(0) - "a".charCodeAt(0) + 1;


  const sum = fileNumber + parseInt(rank);


  return sum % 2 === 0 ? "black" : "white";
};

const verifyToken = (token) => {
  try {
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

// Calculate rank based on totalScore
// Rank thresholds: 1=0, 2=100, 3=300, 4=600, 5=1000, 6=1500, 7=2200, 8=3000+
const calculateRank = (totalScore) => {
  if (totalScore >= 3000) return 8; // الماس
  if (totalScore >= 2200) return 7; // یاقوت
  if (totalScore >= 1500) return 6; // زمرد
  if (totalScore >= 1000) return 5; // فیروزه
  if (totalScore >= 600) return 4; // مرمر
  if (totalScore >= 300) return 3; // یشم
  if (totalScore >= 100) return 2; // اوپال
  return 1; // کهربا
};

// Toast configuration - common style for all toasts
export const toastConfig = {
  borderRadius: "10px",
  background: "#040e1c",
  color: "#fff",
  fontSize: "14px",
};

export { getGreeting, toFarsiNumber, getSquareColor, idGenerator, verifyToken, calculateRank };

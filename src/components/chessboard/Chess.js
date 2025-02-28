"use client";
import React from "react";
import { Chessboard } from "react-chessboard";
import BoardLabels from "./BoardLabels";

const Chess = () => {

  const customPieces = () => {
    const pieceImages = {
      wP: "/pieces/white-pawn.png",
      wR: "/pieces/white-rook.png",
      wN: "/pieces/white-knight.png",
      wB: "/pieces/white-bishop.png",
      wQ: "/pieces/white-queen.png",
      wK: "/pieces/white-king.png",
      bP: "/pieces/black-pawn.png",
      bR: "/pieces/black-rook.png",
      bN: "/pieces/black-knight.png",
      bB: "/pieces/black-bishop.png",
      bQ: "/pieces/black-queen.png",
      bK: "/pieces/black-king.png",
    };

    const pieces = {};
    Object.keys(pieceImages).forEach((piece) => {
      pieces[piece] = ({ squareWidth }) => (
        <img
          src={pieceImages[piece]}
          alt={piece}
          style={{
            width: squareWidth,
            height: squareWidth,
            padding: "5px",
            objectFit: "contain",
          }}
        />
      );
    });

    return pieces;
  };

  return (
    <div className="w-full relative p-4 bg-gray-50 bg-opacity-15 backdrop-blur border border-gray-50 border-opacity-15 rounded-3xl">
      {/* board Labels */}
      <BoardLabels />

      <Chessboard
        customPieces={customPieces()}
        customDarkSquareStyle={{ backgroundColor: "#373855" }}
        customLightSquareStyle={{ backgroundColor: "#f3f4f6" }}
        showBoardNotation={false}
        customBoardStyle={{
          height: "fit-content",
          borderRadius: "16px",
          direction: "ltr",
        }}
        id="BasicBoard"
      />
    </div>
  );
};

export default Chess;

import React from "react";

const BoardLabels = () => {
  const letterLabels = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const numberLabels = ["8", "7", "6", "5", "4", "3", "2", "1"];

  return (
    <>
      {" "}
      {/* letter label */}
      <div
        dir="ltr"
        className="w-full absolute -bottom-[3px] left-0 grid grid-cols-8 px-4"
      >
        {letterLabels.map((letter) => (
          <div key={letter} className="flex justify-center items-center">
            <span className="text-xs font-light text-gray-200 uppercase">
              {letter}
            </span>
          </div>
        ))}
      </div>
      {/* letter label */}
      <div
        dir="ltr"
        className="w-full absolute top-0.5 left-0 grid grid-cols-8 px-4"
      >
        {letterLabels.map((letter) => (
          <div key={letter} className="flex justify-center items-center">
            <span className="text-xs font-light text-gray-200 uppercase">
              {letter}
            </span>
          </div>
        ))}
      </div>
      {/* number label */}
      <div
        dir="ltr"
        className="h-full absolute top-0 left-1 grid grid-rows-8 py-4"
      >
        {numberLabels.map((rank) => (
          <div key={rank} className="flex justify-center items-center">
            <span className="text-xs font-light text-gray-200 uppercase">
              {rank}
            </span>
          </div>
        ))}
      </div>
      {/* number label */}
      <div
        dir="ltr"
        className="h-full absolute top-0 right-1 grid grid-rows-8 py-4"
      >
        {numberLabels.map((rank) => (
          <div key={rank} className="flex justify-center items-center">
            <span className="text-xs font-light text-gray-200 uppercase">
              {rank}
            </span>
          </div>
        ))}
      </div>
    </>
  );
};

export default BoardLabels;

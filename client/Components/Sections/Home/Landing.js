import React from "react";
import MarqueeHero from "@/Components/Components/MarqueeHero";
import CircularText from "@/Components/Animations/CircularText";

const Landing = () => {
  return (
    <div className="relative">
      <MarqueeHero />
      <div className="absolute bottom-5 z-10 w-full p-5">
        <div className="flex items-start justify-between">
          <div className="w-full md:w-[60%] lg:w-[35%] pr-24 md:pr-0 flex flex-col gap-5">
            <p className="para">
              Where street culture meets everyday elegance. Naivora brings you
              pieces that don't just follow trends — they define your own. Bold
              cuts, honest comfort, made for those who wear their identity out
              loud.
            </p>
            <div>
              <button className="bg-[#5C1A2E] text-white rounded-full px-10 py-1">
                Explore Now
              </button>
            </div>
          </div>
          <div className="fixed right-5 bottom-10">
            <CircularText
              text="SCROLL ♦ SCROLL ♦ SCROLL ♦ SCROLL ♦ "
              onHover="slowDown"
              spinDuration={20}
              className=""
            />
          </div>
        </div>
      </div>
    </div>
    // <div>

    // </div>
  );
};

export default Landing;

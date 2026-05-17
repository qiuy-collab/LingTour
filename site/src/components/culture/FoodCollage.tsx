type Props = {
  images: string[];
};

export function FoodCollage({ images }: Props) {
  if (images.length < 3) return null;

  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-lg sm:aspect-square lg:aspect-[5/4]">
      {/* Image 1 — large, top-left anchor */}
      <div
        className="image-sheen absolute left-0 top-0 z-10 h-[65%] w-[68%] -rotate-1 border-8 border-white bg-cover bg-center scrapbook-shadow transition-transform duration-500 hover:rotate-0"
        style={{ backgroundImage: `url(${images[0]})` }}
      >
        <div className="absolute -top-3 left-1/3 h-6 w-20 -translate-x-1/2 bg-white/30 backdrop-blur-[2px] border border-black/5 -rotate-12" />
      </div>

      {/* Image 2 — medium, bottom-right overlapping */}
      <div
        className="image-sheen absolute bottom-0 right-0 z-20 h-[55%] w-[58%] rotate-2 border-8 border-white bg-cover bg-center scrapbook-shadow transition-transform duration-500 hover:rotate-0"
        style={{ backgroundImage: `url(${images[1]})` }}
      />

      {/* Image 3 — small, tucked top-right */}
      <div
        className="image-sheen absolute right-[6%] top-[6%] z-30 h-[32%] w-[30%] -rotate-6 border-4 border-white bg-cover bg-center scrapbook-shadow transition-transform duration-500 hover:rotate-0"
        style={{ backgroundImage: `url(${images[2]})` }}
      >
        <div className="absolute -top-2 right-2 h-4 w-12 bg-white/40 backdrop-blur-[2px] border border-black/5 rotate-45" />
      </div>

      {/* Image 4 — tiny, peeking bottom-left */}
      {images[3] && (
        <div
          className="image-sheen absolute bottom-[18%] left-[8%] z-30 h-[22%] w-[22%] rotate-12 border-4 border-white bg-cover bg-center scrapbook-shadow transition-transform duration-500 hover:rotate-0"
          style={{ backgroundImage: `url(${images[3]})` }}
        />
      )}
    </div>
  );
}

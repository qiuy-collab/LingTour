type Props = {
  images: string[];
};

export function FoodCollage({ images }: Props) {
  if (images.length < 3) return null;

  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-lg sm:aspect-square lg:aspect-[5/4]">
      {/* Image 1 — large, top-left anchor */}
      <div
        className="image-sheen absolute left-0 top-0 z-10 h-[65%] w-[68%] bg-cover bg-center shadow-[0_12px_40px_rgba(17,25,35,0.18)]"
        style={{ backgroundImage: `url(${images[0]})` }}
      />

      {/* Image 2 — medium, bottom-right overlapping */}
      <div
        className="image-sheen absolute bottom-0 right-0 z-20 h-[55%] w-[58%] bg-cover bg-center shadow-[0_12px_40px_rgba(17,25,35,0.2)]"
        style={{ backgroundImage: `url(${images[1]})` }}
      />

      {/* Image 3 — small, tucked top-right */}
      <div
        className="image-sheen absolute right-[6%] top-[6%] z-30 h-[32%] w-[30%] bg-cover bg-center shadow-[0_8px_28px_rgba(17,25,35,0.22)]"
        style={{ backgroundImage: `url(${images[2]})` }}
      />

      {/* Image 4 — tiny, peeking bottom-left */}
      {images[3] && (
        <div
          className="image-sheen absolute bottom-[18%] left-[8%] z-30 h-[22%] w-[22%] bg-cover bg-center shadow-[0_8px_28px_rgba(17,25,35,0.2)]"
          style={{ backgroundImage: `url(${images[3]})` }}
        />
      )}
    </div>
  );
}

type Props = {
  images: string[];
};

export function GalleryStack({ images }: Props) {
  if (images.length < 2) return null;

  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-lg sm:aspect-square lg:aspect-[4/3]">
      {/* Main anchor image — large, bottom layer */}
      <div
        className="image-sheen absolute bottom-0 left-0 z-10 h-[76%] w-[72%] border-8 border-white bg-cover bg-center scrapbook-shadow transition-transform duration-500 hover:rotate-1"
        style={{ backgroundImage: `url(${images[0]})` }}
      />

      {/* Secondary image — peeking from top-right */}
      <div
        className="image-sheen absolute right-0 top-0 z-20 h-[52%] w-[48%] -rotate-2 border-8 border-white bg-cover bg-center scrapbook-shadow transition-transform duration-500 hover:rotate-0"
        style={{ backgroundImage: `url(${images[1]})` }}
      >
        <div className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 bg-white/40 backdrop-blur-[2px] border border-black/5 -rotate-1" />
      </div>

      {/* Third image — small, tucked bottom-right */}
      {images[2] && (
        <div
          className="image-sheen absolute bottom-[8%] right-[6%] z-30 h-[30%] w-[28%] rotate-3 border-4 border-white bg-cover bg-center scrapbook-shadow transition-transform duration-500 hover:rotate-0"
          style={{ backgroundImage: `url(${images[2]})` }}
        />
      )}
    </div>
  );
}

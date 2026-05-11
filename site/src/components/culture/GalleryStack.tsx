type Props = {
  images: string[];
};

export function GalleryStack({ images }: Props) {
  if (images.length < 2) return null;

  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-lg sm:aspect-square lg:aspect-[4/3]">
      {/* Main anchor image — large, bottom layer */}
      <div
        className="image-sheen absolute bottom-0 left-0 z-10 h-[76%] w-[72%] bg-cover bg-center shadow-[0_12px_40px_rgba(17,25,35,0.18)]"
        style={{ backgroundImage: `url(${images[0]})` }}
      />

      {/* Secondary image — peeking from top-right */}
      <div
        className="image-sheen absolute right-0 top-0 z-20 h-[52%] w-[48%] bg-cover bg-center shadow-[0_12px_40px_rgba(17,25,35,0.22)]"
        style={{ backgroundImage: `url(${images[1]})` }}
      />

      {/* Third image — small, tucked bottom-right, slightly rotated feel via offset */}
      {images[2] && (
        <div
          className="image-sheen absolute bottom-[8%] right-[6%] z-30 h-[30%] w-[28%] bg-cover bg-center shadow-[0_8px_28px_rgba(17,25,35,0.25)]"
          style={{ backgroundImage: `url(${images[2]})` }}
        />
      )}
    </div>
  );
}

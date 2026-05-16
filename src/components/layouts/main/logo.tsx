import Image from "next/image";
import Link from "next/link";

import { IMAGES } from "@/constants/images";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  imageClassName?: string;
  href?: string;
  size?: number;
};

function Logo({
  className,
  imageClassName,
  href = "/",
  size = 58,
}: LogoProps) {
  return (
    <Link
      href={href}
      aria-label="Go to homepage"
      className={cn(
        "text-primary flex shrink-0 items-center justify-center transition-opacity select-none hover:opacity-80",
        className,
      )}
    >
      <Image
        src={IMAGES.LOGO}
        alt="Logo"
        width={size}
        height={size}
        priority
        className={cn("object-contain", imageClassName)}
      />
    </Link>
  );
}

export default Logo;
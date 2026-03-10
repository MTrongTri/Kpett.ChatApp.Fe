import Link from "next/link";

function Logo() {
  return (
    <Link
      href="/"
      className="
        font-serif italic font-black text-[26px] tracking-tighter leading-none
        text-primary select-none transition-opacity
        flex-shrink-0 mr-8
      "
    >
      K
      <span className="
        not-italic font-light 
        text-zinc-900 dark:text-zinc-100 
        transition-colors duration-300
      ">
        PET
      </span>
    </Link>
  );
}

export default Logo;
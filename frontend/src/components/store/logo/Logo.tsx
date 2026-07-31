"use client";

import Image from "next/image";
import Link from "next/link";

const Logo = () => {
  return (
    <div>
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/Apple.svg"
          alt="Apple IT Zone"
          width={40}
          height={40}
          priority
          className="object-contain max-sm:w-12 max-sm:h-12"
          style={{ width: "40px", height: "40px" }}
        />
        <Image
          src="/LText.svg"
          alt="Apple IT Zone"
          width={150}
          height={150}
          priority
          className="object-contain max-sm:w-28 max-sm:h-28"
          style={{ width: "150px", height: "150px" }}
        />
      </Link>
    </div>
  );
};

export default Logo;

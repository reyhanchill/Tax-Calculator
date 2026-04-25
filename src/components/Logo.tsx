// TaxFlow logo using the provided favicon asset
import Link from "next/link";
import Image from "next/image";
import faviconLogo from "../../images/favicon.png";

const SIZES = {
  xs: { icon: 28 },
  sm: { icon: 48 },
  md: { icon: 64 },
  lg: { icon: 80 },
};

function LogoMark({ size = 28 }: { size?: number }) {
  const width = Math.round((faviconLogo.width / faviconLogo.height) * size);
  return (
    <Image
      src={faviconLogo}
      alt="TaxFlow logo"
      width={width}
      height={size}
      className="h-auto shrink-0"
    />
  );
}

export function Logo({
  size = "sm",
  link = true,
  href = "/#home",
}: {
  size?: keyof typeof SIZES;
  link?: boolean;
  href?: string;
}) {
  const s = SIZES[size];
  const inner = <LogoMark size={s.icon} />;
  if (!link) return inner;
  return (
    <Link href={href} className="inline-flex items-center hover:opacity-80 transition-opacity">
      {inner}
    </Link>
  );
}

// Full-size centered logo for login/register pages
export function LogoFull() {
  return <LogoMark size={72} />;
}

import Link from 'next/link';

export default function Header() {
  return (
    <header className="max-w-[960px] mx-auto w-full px-4 py-3 flex items-center">
      <Link href="/" className="text-black hover:text-black no-underline">
        <h1 className="text-2xl font-semibold m-0">Ride Every Road</h1>
      </Link>
    </header>
  );
}

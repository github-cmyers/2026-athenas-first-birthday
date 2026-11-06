import { Bunting, PartyOwl } from "./decor";

export default function Footer() {
  return (
    <footer className="pb-12 pt-4 text-center">
      <div className="flex">
        <Bunting flags={9} offset={2} className="flex-1" />
        <Bunting flags={9} offset={5} className="hidden flex-1 md:block" />
      </div>
      <PartyOwl className="mx-auto mt-2 w-20 origin-bottom animate-wobble" />
      <p className="mt-4 px-4 font-display text-2xl font-semibold text-ink md:text-3xl">
        We can&apos;t wait to celebrate with you!
      </p>
      <div className="mt-2 text-2xl" aria-hidden="true">🎈 🎂 🎉</div>
    </footer>
  );
}

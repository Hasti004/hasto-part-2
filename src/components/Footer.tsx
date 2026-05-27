import { ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto max-w-[1600px] px-6 pb-10 pt-24 md:px-10 md:pt-32">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 md:col-span-7">
            <p className="text-[11px] lowercase tracking-[0.2em] text-paper/50">
              (stay close)
            </p>
            <h3
              className="mt-4 font-display font-light leading-[0.9] tracking-[-0.04em]"
              style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)" }}
            >
              letters, drops, the occasional <em className="font-serif italic text-lavender-300">love note.</em>
            </h3>
            <form
              className="mt-8 flex max-w-lg items-center gap-2 border-b border-paper/30 pb-3"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full bg-transparent text-lg lowercase outline-none placeholder:text-paper/40"
              />
              <button className="group flex items-center gap-1 text-sm lowercase text-paper/80 hover:text-paper">
                subscribe
                <ArrowUpRight
                  size={16}
                  className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </button>
            </form>
          </div>

          <FooterCol
            title="shop"
            links={["rings", "earrings", "necklaces", "bracelets", "gift cards"]}
          />
          <FooterCol
            title="house"
            links={["our story", "care guide", "journal", "press"]}
          />
        </div>

        <div className="mt-20 flex flex-col gap-8 border-t border-paper/15 pt-8">
          <h2
            className="condensed font-display font-medium leading-[0.82] tracking-[-0.06em]"
            style={{ fontSize: "clamp(4rem, 24vw, 24rem)" }}
          >
            hasto
          </h2>
          <div className="flex flex-col-reverse items-start justify-between gap-4 text-[11px] lowercase tracking-[0.2em] text-paper/50 md:flex-row md:items-center">
            <p>© 2026 hasto by hasti · made slowly in ahmedabad, india</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-paper">instagram</a>
              <a href="#" className="hover:text-paper">pinterest</a>
              <a href="#" className="hover:text-paper">contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div className="col-span-6 md:col-span-2 md:col-start-auto">
      <p className="text-[11px] lowercase tracking-[0.2em] text-paper/50">
        ({title})
      </p>
      <ul className="mt-4 space-y-2">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="text-sm lowercase text-paper/80 transition hover:text-paper">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

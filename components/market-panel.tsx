import { MarketRow, ContentCard } from "@/lib/types";
import CopyButton from "./copy-button";

export default function MarketPanel({
  id,
  markets,
  energy,
}: {
  id?: string;
  markets: MarketRow[];
  energy: ContentCard[];
}) {
  return (
    <section id={id} className="space-y-4">
      <h3 className="text-[14px] font-semibold text-on-surface mb-4">Markets</h3>

      <div className="bg-surface border border-outline-variant">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container">
              <th className="text-[11px] font-semibold text-on-surface-variant uppercase px-4 py-2">
                Exchange
              </th>
              <th className="text-[11px] font-semibold text-on-surface-variant uppercase px-4 py-2 text-right">
                Latest
              </th>
              <th className="text-[11px] font-semibold text-on-surface-variant uppercase px-4 py-2 text-right">
                Move
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {markets.map((row, i) => (
              <tr key={i}>
                <td className="text-[13px] text-on-surface px-4 py-2">
                  {row.exchange}
                </td>
                <td className="font-mono text-[13px] text-on-surface px-4 py-2 text-right">
                  {row.latest}
                </td>
                <td
                  className={`font-mono text-[13px] px-4 py-2 text-right font-semibold ${
                    row.direction === "up" ? "text-tertiary" : "text-error"
                  }`}
                >
                  {row.move}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-0.5">
        {energy.map((card, i) => (
          <div key={i} className="bg-surface border border-outline-variant p-4">
            <h4 className="text-[14px] font-semibold text-on-surface mb-1">
              {card.title}
            </h4>
            <p className="text-[13px] text-on-surface-variant leading-relaxed mb-2">
              {card.desc}
            </p>
            <CopyButton url={card.source_url} />
          </div>
        ))}
      </div>
    </section>
  );
}

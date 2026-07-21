import { AlertItem } from "@/lib/types";
import AlertPanel from "./alert-panel";

export default function IndustryPanel({
  id,
  items,
}: {
  id?: string;
  items: AlertItem[];
}) {
  return <AlertPanel id={id} title="Industrial Gas Pulse" items={items} />;
}

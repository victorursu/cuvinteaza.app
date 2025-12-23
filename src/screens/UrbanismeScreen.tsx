import fallbackUrbanisme from "../data/fallbackUrbanisme.ro.json";
import { URBANISME_URL } from "../config";
import { DictionaryScreen } from "./DictionaryScreen";

export function UrbanismeScreen() {
  return (
    <DictionaryScreen
      title="Urbanisme"
      subtitle="limbaj urban"
      url={URBANISME_URL}
      fallback={fallbackUrbanisme as unknown}
    />
  );
}



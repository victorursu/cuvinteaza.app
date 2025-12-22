import fallbackRegionalisme from "../data/fallbackRegionalisme.ro.json";
import { REGIONALISME_URL } from "../config";
import { DictionaryScreen } from "./DictionaryScreen";

export function RegionalismeScreen() {
  return (
    <DictionaryScreen
      title="Regionalisme"
      url={REGIONALISME_URL}
      fallback={fallbackRegionalisme as unknown}
    />
  );
}



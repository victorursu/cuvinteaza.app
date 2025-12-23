import fallbackRegionalisme from "../data/fallbackRegionalisme.ro.json";
import { REGIONALISME_URL } from "../config";
import { DictionaryScreen } from "./DictionaryScreen";

export function RegionalismeScreen() {
  return (
    <DictionaryScreen
      title="Regionalisme"
      subtitle="expresii regionale din toată țara"
      url={REGIONALISME_URL}
      fallback={fallbackRegionalisme as unknown}
    />
  );
}



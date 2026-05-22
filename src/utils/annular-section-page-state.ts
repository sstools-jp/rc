import type { FormState } from "@/forms/form-state";
import type { SectionForceMode } from "@/components/SectionForceModeSelector";

export type AnnularSectionPageState = {
  form: FormState;
  sectionForceMode: SectionForceMode;
};

export { resolveAnnularSectionPageStateFromUrl, buildAnnularSectionShareUrl } from "@/utils/share-url";
export {
  loadAnnularSectionPageStateFromStorage,
  saveAnnularSectionPageStateToStorage,
} from "@/utils/storage";

import LegalDoc from "@/components/legal/LegalDoc";
import { TERMS } from "@/lib/legal/content";

export default function TermsPage() {
  return <LegalDoc {...TERMS} />;
}

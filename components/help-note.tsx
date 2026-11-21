import { HELPLINE_URL } from "@/lib/help";

export function HelpNote() {
  return (
    <details className="help-note">
      <summary>If you are struggling</summary>
      <p>If you are in danger or thinking of harming yourself, please contact your local emergency services first. You do not have to carry this alone.</p>
      <p>
        To find a free, confidential helpline in your country, visit{" "}
        <a href={HELPLINE_URL} target="_blank" rel="noopener noreferrer">findahelpline.com<span className="sr-only"> (opens in a new tab)</span></a>.
      </p>
    </details>
  );
}

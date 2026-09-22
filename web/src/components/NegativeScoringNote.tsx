export function NegativeScoringNote({
  applicable,
  details,
}: {
  applicable: boolean;
  details?: string;
}) {
  return (
    <div className={`neg-score${applicable ? " neg-score-yes" : " neg-score-no"}`}>
      <p className="neg-score-line">
        Negative scoring applicable:{" "}
        <span className="neg-score-badge">{applicable ? "Yes" : "No"}</span>
      </p>
      {applicable && details ? <p className="neg-score-details">{details}</p> : null}
    </div>
  );
}

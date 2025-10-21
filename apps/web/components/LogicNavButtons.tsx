import React from "react";

type Props = {
  canNext: boolean;
  onNext: () => void;
  onSkip: () => void;
  isLoading?: boolean;
};

export default function LogicNavButtons({ canNext, onNext, onSkip, isLoading }: Props) {
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
      <button type="button" onClick={onSkip} className="btn" aria-label="Skip lesson">
        I don’t feel like it
      </button>
      <button type="button" onClick={onNext} disabled={!canNext || !!isLoading} className="btn-primary" aria-label="Next lesson">
        Next
      </button>
    </div>
  );
}

"use client";

export default function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="btn-chunky bg-blush">
      <span aria-hidden="true">🖨️</span>
      {label}
    </button>
  );
}

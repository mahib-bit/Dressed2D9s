export default function Pagination({ page, hasNext, onChange }) {
  return (
    <div className="mt-8 flex items-center justify-center gap-3">
      <button
        className="btn btn-outline btn-sm"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        « Prev
      </button>
      <span className="text-sm text-base-content/70">Page {page}</span>
      <button
        className="btn btn-outline btn-sm"
        disabled={!hasNext}
        onClick={() => onChange(page + 1)}
      >
        Next »
      </button>
    </div>
  );
}

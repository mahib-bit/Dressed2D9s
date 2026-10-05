import { useQueryClient } from "@tanstack/react-query";
import AnimeCard from "./AnimeCard.jsx";
import { GridSkeleton } from "./Skeleton.jsx";

// `getSubtitle(anime)` optionally returns a custom line for each card
export default function AnimeGrid({
  items,
  isLoading,
  error,
  emptyText = "Nothing found.",
  getSubtitle,
}) {
  const queryClient = useQueryClient();

  if (isLoading) return <GridSkeleton />;

  if (error) {
    return (
      <div role="alert" className="c22-error">
        <p className="font-bold">⚠ Could not load this section</p>
        <p className="text-sm opacity-80">{error.message}</p>
        <button
          className="btn btn-primary btn-sm mt-3"
          onClick={() =>
            queryClient.refetchQueries({ predicate: (q) => q.state.status === "error" })
          }
        >
          Try again
        </button>
      </div>
    );
  }

  if (!items?.length) {
    return <p className="py-10 text-center text-base-content/60">{emptyText}</p>;
  }

  // Jikan sometimes returns the same anime twice in one page — dedupe by id.
  const unique = [...new Map(items.map((a) => [a.mal_id, a])).values()];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
      {unique.map((anime) => (
        <AnimeCard key={anime.mal_id} anime={anime} subtitle={getSubtitle?.(anime)} />
      ))}
    </div>
  );
}

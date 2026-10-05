import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getTopAnime, getSeasonNow, searchAnime, getGenres } from "../api/anime";

export const useTopAnime = (page = 1, filter) =>
  useQuery({
    queryKey: ["top", page, filter],
    queryFn: () => getTopAnime(page, filter),
    placeholderData: keepPreviousData,
  });

export const useSeasonNow = (page = 1) =>
  useQuery({
    queryKey: ["season-now", page],
    queryFn: () => getSeasonNow(page),
  });

export const useSearchAnime = (filters) =>
  useQuery({
    queryKey: ["search", filters],
    queryFn: () => searchAnime(filters),
    placeholderData: keepPreviousData,
  });

export const useGenres = () =>
  useQuery({
    queryKey: ["genres"],
    queryFn: getGenres,
    staleTime: 1000 * 60 * 60,
  });

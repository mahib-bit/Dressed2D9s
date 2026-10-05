import { useQuery } from "@tanstack/react-query";
import { getAnime, getAnimeEpisodes } from "../api/anime";

export const useAnimeDetail = (id) =>
  useQuery({
    queryKey: ["anime", id],
    queryFn: () => getAnime(id),
    enabled: !!id,
  });

export const useAnimeEpisodes = (id, page = 1) =>
  useQuery({
    queryKey: ["episodes", id, page],
    queryFn: () => getAnimeEpisodes(id, page),
    enabled: !!id,
  });

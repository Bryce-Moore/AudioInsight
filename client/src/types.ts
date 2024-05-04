export type Artist = {
  id: string;
  name: string;
};

export type Track = {
  id: string;
  name: string;
  artists: Artist[];
  album?: {
    id: string;
    name: string;
    images: { url: string; height: number; width: number }[];
  };
  duration_ms?: number;
  uri?: string;
  danceability?: number;
  energy?: number;
  valence?: number;
};

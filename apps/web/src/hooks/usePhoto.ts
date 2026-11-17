import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { isPrivatePhoto, photosService } from '../services/photos.service';
export function usePhoto(source?: string | null) {
  const privatePhoto = isPrivatePhoto(source);
  const query = useQuery({ queryKey: ['photos', source], queryFn: ({ signal }) => photosService.read(source!, signal), enabled: privatePhoto, staleTime: 300_000, gcTime: 60_000 });
  const [image, setImage] = useState<{ blob: Blob; url: string }>();
  useEffect(() => {
    if (!query.data) { setImage(undefined); return; }
    const url = URL.createObjectURL(query.data);
    setImage({ blob: query.data, url });
    return () => URL.revokeObjectURL(url);
  }, [query.data]);
  return { src: privatePhoto ? image?.blob === query.data ? image?.url : null : source, isLoading: privatePhoto && query.isLoading, error: privatePhoto ? query.error : null };
}

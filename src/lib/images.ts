
import { createApi } from 'unsplash-js';

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY!,
});

export async function getImages(query: string) {
  const result = await unsplash.search.getPhotos({
    query,
    page: 1,
    perPage: 10,
  });

  if (result.errors) {
    console.error('error occurred: ', result.errors[0]);
    return [];
  } else {
    return result.response.results.map(photo => photo.urls.small);
  }
}

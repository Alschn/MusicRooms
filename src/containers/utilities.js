export const getArtistsString = (artists) => (
  artists.reduce((total, {name}, currentIndex, arr) => (
    total += currentIndex !== arr.length - 1 ? `${name}, ` : name
  ), ``)
)
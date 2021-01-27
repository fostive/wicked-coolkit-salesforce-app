export const api = (route) => {
  return `https://wicked-coolkit-webring.herokuapp.com${route}`;
};

export const sticker = (s) => {
  return `https://unpkg.com/wicked-coolkit/dist/stickers/svg/${s}.svg`;
};

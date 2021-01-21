export const api = (host) => {
  return `$https://${host}/api`;
};

export const sticker = (s) => {
  return `https://unpkg.com/wicked-coolkit/dist/stickers/svg/${s}.svg`;
};

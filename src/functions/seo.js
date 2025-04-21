export default function seo(data = {}) {
  const ui_config = JSON.parse(
    window.localStorage.getItem("ui_config") ||
      window.sessionStorage.getItem("ui_config") ||
      "{}"
  );

  data.title = data.title || ui_config.title || "RepelisPlus";
  data.description =
    data.description ||
    "RepelisPlus es la mejor plataforma para ver películas y series español latino, full hd, la mejor calidad, los mejores servidores";
  data.image = "https://i.ibb.co/N6Lc0Xms/unnamed.png"; // URL fija
  data.type = data.type || "website";

  document.title = data.title;
  document
    .querySelector('meta[property="og:title"]')
    .setAttribute("content", data.title);
  document
    .querySelector('meta[name="description"]')
    .setAttribute("content", data.description);
  document
    .querySelector('meta[property="og:description"]')
    .setAttribute("content", data.description);
  document
    .querySelector('meta[property="og:image"]')
    .setAttribute("content", data.image);
  document
    .querySelector('meta[property="og:type"]')
    .setAttribute("content", data.type);
}

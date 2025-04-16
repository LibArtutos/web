import React, {Component} from "react";
import {Link} from "react-router-dom";

import {
  Avatar,
  Button,
  ButtonGroup,
  Chip,
  ClickAwayListener,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  CircularProgress,
} from "@material-ui/core";

import {Rating} from "@material-ui/lab";
import StarIcon from "@material-ui/icons/Star";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import SubtitlesOutlinedIcon from "@material-ui/icons/SubtitlesOutlined";
import YouTubeIcon from "@material-ui/icons/YouTube";

import DPlayer from "libdrive-player";
import {default as toWebVTT} from "srt-webvtt";

import Swal from "sweetalert2/src/sweetalert2.js";
import "@sweetalert2/theme-dark/dark.css";

import axios from "axios";

import {DownloadMenu, guid, PlayerMenu, seo, StarDialog, theme, TrailerDialog,} from "../../../components";


export default class MovieView extends Component {
  constructor(props) {
    super(props);
    
    // Obtener directamente el ID de la URL al inicializar
    const urlPath = window.location.pathname;
    const urlMatch = urlPath.match(/\/([^\/]+)$/);
    
    let urlId = "";
    if (urlMatch && urlMatch[1]) {
      urlId = urlMatch[1];
    }
    
    this.state = {
      ...props.state,
      subtitleMenuAnchor: false,
      tooltipOpen: false,
      tooltipOpen2: false,
      trailer: {},
      // Estado modificado para usar lógica automática
      currentPlayer: "alternative", // Intentamos usar primero el alternativo
      alternativeId: null,
      directUrlId: urlId,
      isLoadingAltId: true,
      iframeError: false // Nuevo estado para detectar errores de iframe
    };
    
    // Métodos existentes
    this.onFileChange = this.onFileChange.bind(this);
    this.prettyDate = this.prettyDate.bind(this);
    this.handleStar = this.handleStar.bind(this);
    this.handleStarClose = this.handleStarClose.bind(this);
    this.handleTrailer = this.handleTrailer.bind(this);
    this.handleTrailerClose = this.handleTrailerClose.bind(this);
    this.handleSubtitleMenuOpen = this.handleSubtitleMenuOpen.bind(this);
    this.handleSubtitleMenuClose = this.handleSubtitleMenuClose.bind(this);
    
    // Actualización de métodos
    this.handlePlayerChange = this.handlePlayerChange.bind(this);
    this.fetchAlternativeId = this.fetchAlternativeId.bind(this);
    this.handleIframeError = this.handleIframeError.bind(this); // Nuevo método para manejar errores
  }

  componentDidMount() {
    let { metadata, ui_config } = this.state;
    let year = new Date().getFullYear();

    seo({
      title: `${ui_config.title || "GBStream"} - ${
          metadata.title || metadata.name
      } (${year}) - Español Latino Gratis`,
      description: `Watch ${metadata.title || metadata.name} on ${
          ui_config.title || "GBStream"
      }! — ${metadata.overview}`,
      image: metadata.backdropPath,
      type: "video.movie",
    });
    
    // Obtener el ID alternativo al cargar
    this.fetchAlternativeId();
  }
  
  // Método actualizado para obtener el ID alternativo
  async fetchAlternativeId() {
    try {
      // Usar directamente el ID que ya obtuvimos en el constructor
      const originalId = this.state.directUrlId;
      
      console.log("[Debug] ID obtenido de la URL:", originalId);
      
      // Llamar al servicio para obtener el ID alternativo
      const response = await axios.get(`https://id-earn.artutos-data.workers.dev/${originalId}`);
      
      // Depurar la respuesta completa
      console.log("[Debug] Respuesta completa:", response);
      console.log("[Debug] Data recibida:", response.data);
      
      // Determinar el ID alternativo correctamente según la estructura
      let altId;
      if (typeof response.data === 'object' && response.data.id) {
        altId = response.data.id;
        console.log("[Debug] ID obtenido del objeto response.data.id:", altId);
      } else if (typeof response.data === 'string') {
        altId = response.data;
        console.log("[Debug] ID obtenido directamente como string:", altId);
      } else {
        console.error("[Debug] No se pudo determinar el ID alternativo:", response.data);
        altId = null;
      }
      
      console.log("[Debug] ID alternativo final a usar:", altId);
      
      // Verificar si tenemos un ID alternativo válido
      if (altId) {
        // Si tenemos un ID válido, configuramos para usar el reproductor alternativo
        this.setState({
          alternativeId: altId,
          isLoadingAltId: false,
          currentPlayer: "alternative"
        });
      } else {
        // Si no tenemos un ID válido, cambiamos al reproductor por defecto
        console.log("[Debug] No se obtuvo ID alternativo válido, cambiando a reproductor por defecto");
        this.setState({
          isLoadingAltId: false,
          currentPlayer: "default"
        });
      }
    } catch (error) {
      console.error("[Debug] Error obteniendo ID alternativo:", error);
      // En caso de error, cambiamos al reproductor por defecto
      this.setState({ 
        isLoadingAltId: false,
        currentPlayer: "default"
      });
    }
  }
  
  // Método mejorado para manejar errores en el iframe con detección específica de 404
  handleIframeError() {
    console.log("[Debug] Error en el iframe detectado por evento onError");
    // El evento onError es bastante confiable, así que cambiamos directamente
    this.setState({ 
      iframeError: true,
      currentPlayer: "default" 
    });
  }

  // Método simplificado para cambios manuales entre reproductores (si se necesita en el futuro)
  handlePlayerChange(playerType) {
    this.setState({ currentPlayer: playerType });
  }

  async onFileChange(evt) {
    if (evt.target.files.length) {
      if (evt.target.files[0].name.endsWith(".srt")) {
        const vtt = await toWebVTT(evt.target.files[0]);
        this.setState({
          file: vtt,
          fileName: evt.target.files[0].name,
          playerKey: guid(),
        });
      } else {
        this.setState({
          file: URL.createObjectURL(evt.target.files[0]),
          playerKey: guid(),
        });
      }
    } else {
      this.setState({ file: null, playerKey: guid() });
    }
  }

  prettyDate() {
    let old_date = this.state.metadata.releaseDate;
    let date_comp = old_date.split("-");
    let date = new Date(date_comp[0], date_comp[1], date_comp[2]);
    return date.toDateString();
  }

  handleStar() {
    this.setState({ openStarDialog: true });
  }

  handleStarClose(evt) {
    if (evt == "starred") {
      this.setState({ openStarDialog: false, starred: true });
    } else if (evt == "unstarred") {
      this.setState({
        openStarDialog: false,
        starred:
          JSON.parse(window.localStorage.getItem("starred_lists") || "[]").some(
            (i) => i.children.some((x) => x.id == this.state.metadata.id)
          ) || false,
      });
    } else {
      this.setState({ openStarDialog: false });
    }
  }

  handleTrailer() {
    let { auth, metadata, server } = this.state;

    let req_path = `${server}/api/v1/trailer/${metadata.apiId}`;
    let req_args = `?a=${auth}&t=movie&api=${metadata.api}`;

    axios
      .get(req_path + req_args)
      .then((response) =>
        this.setState({
          openTrailerDialog: true,
          trailer: response.data.content,
        })
      )
      .catch((error) => {
        console.error(error);
        if (error.response) {
          let data = error.response.data;
          if (data.code === 401) {
            Swal.fire({
              title: "Error!",
              text: data.message,
              icon: "error",
              confirmButtonText: "Login",
              confirmButtonColor: theme.palette.success.main,
            }).then((result) => {
              if (result.isConfirmed) {
                this.props.history.push("/logout");
              }
            });
          } else if (!server) {
            this.props.history.push("/logout");
          } else {
            Swal.fire({
              title: "Error!",
              text: "No trailer could be found.",
              icon: "error",
              confirmButtonText: "Ok",
              confirmButtonColor: theme.palette.success.main,
            });
          }
        } else if (error.request) {
          if (!server) {
            this.props.history.push("/logout");
          } else {
            Swal.fire({
              title: "Error!",
              text: `libDrive could not communicate with the server! Is '${server}' the correct address?`,
              icon: "error",
              confirmButtonText: "Logout",
              confirmButtonColor: theme.palette.success.main,
              cancelButtonText: "Retry",
              cancelButtonColor: theme.palette.error.main,
              showCancelButton: true,
            }).then((result) => {
              if (result.isConfirmed) {
                this.props.history.push("/logout");
              } else if (result.isDismissed) {
                location.reload();
              }
            });
          }
        }
      });
  }

  handleTrailerClose() {
    this.setState({ openTrailerDialog: false });
  }

  handleSubtitleMenuOpen(evt) {
    let { tracks } = this.state;

    if (tracks.length) {
      this.setState({
        subtitleMenuAnchor: evt.currentTarget,
      });
    } else {
      const subtitleButton = document.getElementById("file-input-button");
      subtitleButton.click();
    }
  }

  handleSubtitleMenuClose() {
    this.setState({
      subtitleMenuAnchor: false,
    });
  }

  render() {
    let {
      default_track,
      default_video,
      file,
      fileName,
      metadata,
      playerKey,
      server,
      videos,
      starred,
      subtitleMenuAnchor,
      tracks,
      tooltipOpen,
      tooltipOpen2,
      trailer,
      // Estados para el reproductor
      currentPlayer,
      alternativeId,
      isLoadingAltId,
      iframeError
    } = this.state;

    if (file) {
      tracks = [{ name: fileName, url: file }];
    }

    // Determine which player to show automatically
    const showAlternativePlayer = currentPlayer === "alternative" && !iframeError;

    return (
      <div className="MovieView">
        {/* Eliminamos el selector de reproductor */}
        
        {/* Contenedor de reproductores */}
        {showAlternativePlayer ? (
          // Reproductor alternativo (iframe)
          <div className="plyr__component" style={{ position: "relative", width: "100%", height: 0, paddingBottom: "56.25%" }}>
            {isLoadingAltId ? (
              // Mostrar indicador de carga mientras obtenemos el ID alternativo
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "#000",
                color: "#fff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "12px",
                borderWidth: "5px",
                borderColor: "black",
                borderStyle: "solid",
              }}>
                <div style={{ textAlign: "center" }}>
                  <CircularProgress size={40} style={{ marginBottom: "10px" }}/>
                  <Typography variant="subtitle1">Cargando reproductor...</Typography>
                </div>
              </div>
            ) : (
              <iframe
                src={`https://Smoothpre.com/embed/${this.state.alternativeId}`}
                frameBorder="0"
                marginWidth="0"
                marginHeight="0"
                scrolling="no"
                allowFullScreen
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  borderRadius: "12px",
                  borderWidth: "5px",
                  borderColor: "black",
                  borderStyle: "solid",
                }}
                onError={this.handleIframeError}
                onLoad={(e) => {
                  // Esperamos un poco para verificar los errores 404 después de que se "cargue" el iframe
                  setTimeout(() => {
                    // Verificación definitiva para errores 404 - busca directamente en la consola
                    const errors = window.performance.getEntries()
                      .filter(entry => {
                        return entry.name.includes(`Smoothpre.com/embed/${this.state.alternativeId}`);
                      });
                    
                    if (errors.length === 0) {
                      // Si no encontramos la entrada del recurso principal, probablemente falló
                      console.log("[Debug] No se encontró el recurso del iframe en las entradas de rendimiento");
                      this.setState({ iframeError: true, currentPlayer: "default" });
                      return;
                    }
                    
                    // Verificamos si hay un 404 específicamente para nuestra URL
                    const has404 = document.querySelector('iframe').contentDocument === null;
                    
                    if (has404) {
                      console.log("[Debug] Detectado error 404 - contentDocument es null");
                      this.setState({ iframeError: true, currentPlayer: "default" });
                    } else {
                      try {
                        // Última verificación: intentar acceder al contenido para ver si es válido
                        const frameContent = document.querySelector('iframe').contentWindow;
                        if (!frameContent || frameContent.document.body.innerHTML === '') {
                          console.log("[Debug] Frame cargado pero contenido vacío o inaccesible");
                          this.setState({ iframeError: true, currentPlayer: "default" });
                        } else {
                          console.log("[Debug] El iframe ha cargado correctamente con contenido válido");
                        }
                      } catch(err) {
                        // Si hay un error de seguridad por CORS, también cambiamos al reproductor por defecto
                        console.log("[Debug] Error de seguridad al acceder al iframe:", err);
                        // Los errores de seguridad generalmente indican que el iframe cargó pero desde otro origen
                        // En este caso, esperamos un segundo más y verificamos si ha habido algún error 404
                        setTimeout(() => {
                          const consoleMessages = window.performance.getEntries()
                            .filter(entry => entry.name.includes('404'));
                          
                          if (consoleMessages.length > 0) {
                            console.log("[Debug] Detectado error 404 en consola después de cargar iframe");
                            this.setState({ iframeError: true, currentPlayer: "default" });
                          }
                          
                          // Último recurso: crear un simple detector de errores 404
                          const createErrorDetector = () => {
                            if (window.iframeError404Detector) return;
                            
                            window.iframeError404Detector = true;
                            const originalFetch = window.fetch;
                            window.fetch = function(...args) {
                              return originalFetch.apply(this, args)
                                .then(response => {
                                  if (response.status === 404 && args[0].includes('Smoothpre.com')) {
                                    console.log("[Debug] Interceptado error 404 en fetch:", args[0]);
                                    document.dispatchEvent(new CustomEvent('iframe404', { detail: args[0] }));
                                  }
                                  return response;
                                });
                            };
                            
                            document.addEventListener('iframe404', () => {
                              console.log("[Debug] Evento 404 detectado, cambiando reproductor");
                              if (this && !this.state.iframeError) {
                                this.setState({ iframeError: true, currentPlayer: "default" });
                              }
                            });
                          };
                          
                          createErrorDetector();
                        }, 1500);
                      }
                    }
                  }, 2000);
                }}
              ></iframe>
            )}
          </div>
        ) : (
          // Reproductor original (mostrado automáticamente si el alternativo falla)
          <div className="plyr__component">
            <DPlayer
              key={playerKey}
              style={{
                borderRadius: "12px",
                borderWidth: "5px",
                borderColor: "black",
                borderStyle: "solid",
              }}
              options={{
                video: {
                  quality: videos,
                  defaultQuality: default_video,
                  pic:
                    metadata.backdropPath ||
                    `${server}/api/v1/image/thumbnail?id=${metadata.id}`,
                },
                subtitle: tracks[default_track],
                preload: "auto",
                theme: theme.palette.primary.main,
                contextmenu: [
                  {
                    text: "GBStream",
                    link: "https://github.com/libDrive/libDrive",
                  },
                ],
                screenshot: true,
                volume: 1,
                lang: "en",
              }}
            />
          </div>
        )}

        <div className="info__container">
          <div className="info__left">
            <img
              className="info__poster"
              src={
                metadata.posterPath ||
                `${server}/api/v1/image/poster?text=${encodeURIComponent(
                  metadata.title
                )}&extention=jpeg`
              }
            />
          </div>
          <div className="info__right">
            <ClickAwayListener
              onClickAway={() => this.setState({ tooltipOpen: false })}
            >
              <Tooltip
                title={
                  <Typography variant="subtitle2">{metadata.name}</Typography>
                }
                arrow
                placement="top-start"
                open={tooltipOpen}
                disableFocusListener
                disableHoverListener
                disableTouchListener
                onClose={() => this.setState({ tooltipOpen: false })}
                PopperProps={{
                  disablePortal: true,
                }}
              >
                <Typography
                  onClick={() => this.setState({ tooltipOpen: true })}
                  variant="h3"
                  style={{ fontWeight: "bold" }}
                  className="info__title"
                >
                  {metadata.title}
                </Typography>
              </Tooltip>
            </ClickAwayListener>
            <Typography
              variant="body1"
              className="info__overview"
              style={{ marginTop: "30px" }}
            >
              {metadata.overview}
            </Typography>
            <div className="vote__container">
              <ClickAwayListener
                onClickAway={() => this.setState({ tooltipOpen2: false })}
              >
                <Tooltip
                  title={
                    <Typography variant="subtitle2">
                      {metadata.voteAverage}/10
                    </Typography>
                  }
                  arrow
                  placement="right"
                  open={tooltipOpen2}
                  disableFocusListener
                  disableHoverListener
                  disableTouchListener
                  onClose={() => this.setState({ tooltipOpen2: false })}
                  PopperProps={{
                    disablePortal: true,
                  }}
                >
                  <div onClick={() => this.setState({ tooltipOpen2: true })}>
                    <Rating
                      name="Rating"
                      value={metadata.voteAverage}
                      max={10}
                      readOnly
                    />
                  </div>
                </Tooltip>
              </ClickAwayListener>
            </div>
            <div className="info__release">
              <IconButton onClick={this.handleStar}>
                {starred ? <StarIcon /> : <StarBorderIcon />}
              </IconButton>
              <Typography
                style={{ display: "flex", alignItems: "center" }}
                variant="body2"
              >
                {metadata.language
                  ? `${this.prettyDate()} (${metadata.language.toUpperCase()})`
                  : this.prettyDate()}
              </Typography>
            </div>
            <div className="info__buttons">
              <PlayerMenu state={this.state} />
              <DownloadMenu state={this.state} />
              <div className="info__button">
                <Button
                  variant="outlined"
                  color="primary"
                  style={{ width: "135px" }}
                  onClick={this.handleTrailer}
                  startIcon={<YouTubeIcon />}
                >
                  Trailer
                </Button>
              </div>
              <div className="info__button">
                <input
                  id="file-input"
                  hidden
                  onChange={this.onFileChange}
                  type="file"
                  accept=".vtt,.srt"
                />
                <Button
                  color="primary"
                  variant="outlined"
                  style={{ width: "135px" }}
                  component="span"
                  aria-controls="subtitles-menu"
                  startIcon={<SubtitlesOutlinedIcon />}
                  onClick={this.handleSubtitleMenuOpen}
                >
                  Subtitle
                </Button>
                <Menu
                  id="subtitles-menu"
                  anchorEl={subtitleMenuAnchor}
                  keepMounted
                  anchorOrigin={{ vertical: "top", horizontal: "center" }}
                  transformOrigin={{ vertical: "top", horizontal: "center" }}
                  open={Boolean(subtitleMenuAnchor)}
                  onClose={this.handleSubtitleMenuClose}
                >
                  {tracks.length ? (
                    <div>
                      {tracks.map((track) => (
                        <a className="no_decoration_link" href={track.url}>
                          <MenuItem onClick={this.handleSubtitleMenuClose}>
                            {track.name}
                          </MenuItem>
                        </a>
                      ))}
                      <Divider />
                    </div>
                  ) : null}
                  <MenuItem
                    onClick={() => {
                      document.getElementById("file-input-button").click();
                      this.setState({ subtitleMenuAnchor: false });
                    }}
                  >
                    Upload
                  </MenuItem>
                </Menu>
                <label htmlFor="file-input" id="file-input-button" />
              </div>
            </div>
            <div className="info__genres">
              {metadata.adult ? (
                <Chip
                  color="secondary"
                  avatar={<Avatar>E</Avatar>}
                  className="info__genre"
                  label={"Adult (18+)"}
                  variant="outlined"
                />
              ) : null}
              {metadata.genres && metadata.genres.length
                ? metadata.genres.map((genre) => (
                    <Link
                      to={`/genres?genre=${genre}`}
                      className="no_decoration_link"
                      key={guid()}
                    >
                      <Chip
                        avatar={<Avatar>{genre.charAt(0)}</Avatar>}
                        className="info__genre"
                        label={genre}
                        variant="outlined"
                      />
                    </Link>
                  ))
                : null}
            </div>
          </div>
        </div>
        <StarDialog
          isOpen={this.state.openStarDialog}
          handleClose={this.handleStarClose}
          metadata={metadata}
        />
        <TrailerDialog
          isOpen={this.state.openTrailerDialog}
          handleClose={this.handleTrailerClose}
          metadata={metadata}
          trailer={trailer}
        />
      </div>
    );
  }
}

import React, {Component} from "react";

import {Link} from "react-router-dom";

import {
    Avatar,
    Button,
    ButtonGroup,
    Chip,
    ClickAwayListener,
    Dialog,
    DialogTitle,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    Tooltip,
    Typography,
    CircularProgress,
} from "@material-ui/core";
import {Rating} from "@material-ui/lab";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import StarIcon from "@material-ui/icons/Star";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import SubtitlesOutlinedIcon from "@material-ui/icons/SubtitlesOutlined";
import YouTubeIcon from "@material-ui/icons/YouTube";

import DPlayer from "libdrive-player";
import {default as toWebVTT} from "srt-webvtt";

import Swal from "sweetalert2/src/sweetalert2.js";
import "@sweetalert2/theme-dark/dark.css";

import axios from "axios";

import {
    ChildrenMenu,
    DownloadMenu,
    guid,
    PlayerMenu,
    PlaylistMenu,
    seo,
    StarDialog,
    theme,
    TrailerDialog,
} from "../../../components";

export class TVBView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...props.state,
      tooltipOpen: false,
      tooltipOpen2: false,
      trailer: {},
    };
    this.prettyDate = this.prettyDate.bind(this);
    this.handleStar = this.handleStar.bind(this);
    this.handleStarClose = this.handleStarClose.bind(this);
    this.handleTrailer = this.handleTrailer.bind(this);
    this.handleTrailerClose = this.handleTrailerClose.bind(this);
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
    let { auth, metadata, server, trailer } = this.state;

    if (!trailer.key) {
      let req_path = `${server}/api/v1/trailer/${metadata.apiId}`;
      let req_args = `?a=${auth}&t=tv&api=${metadata.api}`;

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
                text: "Something went wrong while looking for trailers.",
                icon: "error",
                confirmButtonText: "Ok",
                confirmButtonColor: theme.palette.success.main,
              });
            }
          }
        });
    } else {
      this.setState({ openTrailerDialog: true });
    }
  }

  handleTrailerClose() {
    this.setState({ openTrailerDialog: false });
  }

  render() {
    let { metadata, server, starred, tooltipOpen, tooltipOpen2, trailer } =
      this.state;

    return (
      <div className="TVBView">
        <div className="info__container">
          <div className="info__left">
            <img
              className="info__poster"
              src={
                metadata.posterPath ||
                `${server}/api/v1/image/poster?text=${metadata.title}&extention=jpeg`
              }
            />
            <img
              className="info__backdrop"
              src={
                metadata.backdropPath ||
                `${server}/api/v1/image/backdrop?text=${metadata.title}&extention=jpeg`
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
            <div className="info__buttons2">
              <ChildrenMenu state={this.state} />
              <div className="info__button2">
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
            </div>
            <div className="info__genres">
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

export class TVSView extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      ...props.state, 
      subtitleMenuAnchor: false,
      // Nuevos estados para el reproductor alternativo
      currentPlayer: "alternative", // "alternative" (iframe) o "default" (DPlayer)
      alternativeId: null,
      isLoadingAltId: true
    };
    this.onFileChange = this.onFileChange.bind(this);
    this.handleSubtitleMenuOpen = this.handleSubtitleMenuOpen.bind(this);
    this.handleSubtitleMenuClose = this.handleSubtitleMenuClose.bind(this);
    this.handleClickImage = this.handleClickImage.bind(this);
    this.handleCloseDialog = this.handleCloseDialog.bind(this);
    this.handleParentSeason = this.handleParentSeason.bind(this);
    // Nuevo método para manejar el cambio de reproductor
    this.handlePlayerChange = this.handlePlayerChange.bind(this);
  }

  componentDidMount() {
    let { metadata, q, ui_config } = this.state;

    seo({
      title: `${ui_config.title || "GBStream"} - ${metadata.children[q].name}`,
      description: `Watch ${metadata.children[q].name} on ${
        ui_config.title || "GBStream"
      }!`,
      type: "video.episode",
    });
    
    // Obtener el ID alternativo al cargar el componente
    this.fetchAlternativeId();
  }

  componentDidUpdate(prevProps, prevState) {
    // Si cambia el episodio seleccionado (q), obtener nuevo ID alternativo
    if (prevState.q !== this.state.q) {
      this.fetchAlternativeId();
    }
  }

  componentWillUnmount() {
    let { id, q, watching } = this.state;

    watching[id] = q;

    window.localStorage.setItem("watching", JSON.stringify(watching));
  }
  
  // Nuevo método para obtener el ID alternativo
  async fetchAlternativeId() {
    try {
      // Obtener el ID original
      const { metadata, q } = this.state;
      const originalId = metadata.children[q].id;
      
      // Llamar al servicio para obtener el ID alternativo
      // Reemplaza esta URL con tu servicio real
      const response = await axios.get(`https://ejemplo.com/id=${originalId}`);
      
      // Almacenar el ID alternativo
      this.setState({
        alternativeId: response.data.id || response.data, // Ajusta según el formato de respuesta
        isLoadingAltId: false
      });
    } catch (error) {
      console.error("Error obteniendo ID alternativo:", error);
      this.setState({ isLoadingAltId: false });
    }
  }
  
  // Método para cambiar entre reproductores
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

  handleClickImage(url) {
    this.setState({ image_url: url });
  }

  handleCloseDialog() {
    this.setState({ image_url: null });
  }

  handleParentSeason(next) {
    let { metadata, parent_index } = this.state;

    if (next) {
      if (metadata.parent_children[parent_index + 1]) {
        this.props.history.push(
          `/view/ts/${metadata.parent_children[parent_index + 1].id}`
        );
      }
    } else {
      if (metadata.parent_children[parent_index - 1]) {
        this.props.history.push(
          `/view/ts/${metadata.parent_children[parent_index - 1].id}`
        );
      }
    }
  }

  render() {
    let {
      default_track,
      default_video,
      file,
      fileName,
      image_url,
      metadata,
      parent_index,
      playerKey,
      q,
      server,
      videos,
      tracks,
      subtitleMenuAnchor,
      // Nuevos estados para el reproductor alternativo
      currentPlayer,
      alternativeId,
      isLoadingAltId
    } = this.state;

    if (file) {
      tracks = [{ name: fileName, url: file }];
    }

    function isHash(n, hash) {
      if (n === hash) {
        return "pls-playing";
      } else {
        return "";
      }
    }

    return (
      <div className="TVSView">
        <Dialog
          onClose={this.handleCloseDialog}
          aria-labelledby="img-dialog"
          open={image_url ? true : false}
        >
          <DialogTitle id="img-dialog">Thumbnail</DialogTitle>
          <img src={image_url} style={{ padding: "25px" }} />
        </Dialog>
        
        {/* Selector de reproductor con botones */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          margin: '0 0 15px 0'
        }}>
          <ButtonGroup variant="contained" color="primary">
            <Button 
              onClick={() => this.handlePlayerChange("alternative")}
              style={{ 
                backgroundColor: currentPlayer === "alternative" ? undefined : "transparent",
                fontWeight: currentPlayer === "alternative" ? "bold" : "normal"
              }}
            >
              Reproductor 1
            </Button>
            <Button 
              onClick={() => this.handlePlayerChange("default")}
              style={{ 
                backgroundColor: currentPlayer === "default" ? undefined : "transparent",
                fontWeight: currentPlayer === "default" ? "bold" : "normal"
              }}
            >
              Reproductor 2
            </Button>
          </ButtonGroup>
        </div>
        
        {currentPlayer === "alternative" ? (
          // Reproductor alternativo (iframe)
          <div className="plyr__component" style={{ 
            position: "relative", 
            width: "100%", 
            height: 0, 
            paddingBottom: "56.25%",
            marginBottom: "0px"
          }}>
            {!isLoadingAltId && alternativeId ? (
              <iframe 
                src={`https://Smoothpre.com/embed/${alternativeId}`}
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
                  borderRadius: "12px 12px 0 0",
                  borderWidth: "4px 4px 0 4px",
                  borderColor: "black",
                  borderStyle: "solid",
                }}
              ></iframe>
            ) : (
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
                borderRadius: "12px 12px 0 0",
                borderWidth: "4px 4px 0 4px",
                borderColor: "black",
                borderStyle: "solid",
              }}>
                <div style={{ textAlign: "center" }}>
                  <CircularProgress size={40} style={{ marginBottom: "10px" }}/>
                  <Typography variant="subtitle1">Cargando reproductor...</Typography>
                </div>
              </div>
            )}
            
            {/* Mantener la lista de episodios para el reproductor alternativo */}
            <div className="plyr-playlist-wrapper" style={{ 
              borderRadius: "0 0 12px 12px",
              borderWidth: "0 4px 4px 4px",
              borderColor: "black",
              borderStyle: "solid",
            }}>
              <ul className="plyr-playlist">
                {metadata.children.length
                  ? metadata.children.map((child, n) => (
                      <li className={isHash(n, q)} key={n}>
                        <div>
                          <img
                            onClick={() =>
                              this.handleClickImage(
                                `${server}/api/v1/image/thumbnail?id=${child.id}`
                              )
                            }
                            onError={(e) => (e.target.style = "display: none;")}
                            src={`${server}/api/v1/image/thumbnail?id=${child.id}`}
                            className="plyr-miniposter"
                          />
                          <Link
                            to={{
                              pathname: window.location.pathname,
                              search: `?q=${n}`,
                            }}
                            className="plyr-miniposter-link"
                            key={guid()}
                          >
                            <div>{child.name}</div>
                          </Link>
                        </div>
                      </li>
                    ))
                  : null}
              </ul>
            </div>
          </div>
        ) : (
          // Reproductor original
          <div className="plyr__component">
            <DPlayer
              key={playerKey}
              style={{
                borderRadius: "12px 12px 0 0",
                borderWidth: "4px 4px 0 4px",
                borderColor: "black",
                borderStyle: "solid",
              }}
              options={{
                video: {
                  quality: videos,
                  defaultQuality: default_video,
                  pic: `${server}/api/v1/image/thumbnail?id=${metadata.children[q].id}`,
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
            <div className="plyr-playlist-wrapper">
              <ul className="plyr-playlist">
                {metadata.children.length
                  ? metadata.children.map((child, n) => (
                      <li className={isHash(n, q)} key={n}>
                        <div>
                          <img
                            onClick={() =>
                              this.handleClickImage(
                                `${server}/api/v1/image/thumbnail?id=${child.id}`
                              )
                            }
                            onError={(e) => (e.target.style = "display: none;")}
                            src={`${server}/api/v1/image/thumbnail?id=${child.id}`}
                            className="plyr-miniposter"
                          />
                          <Link
                            to={{
                              pathname: window.location.pathname,
                              search: `?q=${n}`,
                            }}
                            className="plyr-miniposter-link"
                            key={guid()}
                          >
                            <div>{child.name}</div>
                          </Link>
                        </div>
                      </li>
                    ))
                  : null}
              </ul>
            </div>
          </div>
        )}
        
        <div
          className="file__info"
          style={{ background: theme.palette.background.paper }}
        >
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            {metadata.parent_children[parent_index - 1] ? (
              <Tooltip
                title={
                  metadata.parent_children[parent_index - 1]
                    ? metadata.parent_children[parent_index - 1].name
                    : null
                }
                placement="left"
              >
                <IconButton
                  onClick={() => this.handleParentSeason(false)}
                  style={{ justifySelf: "flex-start", marginLeft: "5px" }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <div
                className="MuiIconButton-root MuiButtonBase-root"
                style={{ justifySelf: "flex-end", marginLeft: "5px" }}
              >
                <ArrowBackIcon color="disabled" />
              </div>
            )}
            <div
              style={{
                display: "flex",
                alignContent: "center",
                justifyContent: "center",
                flexWrap: "wrap",
                margin: "20px 5px 20px 5px",
              }}
            >
              <PlayerMenu
                state={{
                  ...this.state,
                  id: metadata.children[q].id,
                  metadata: metadata.children[q],
                }}
              />
              <DownloadMenu state={this.state} tv={true} />
              <PlaylistMenu state={this.state} />
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
            {metadata.parent_children[parent_index + 1] ? (
              <Tooltip
                title={
                  metadata.parent_children[parent_index + 1]
                    ? metadata.parent_children[parent_index + 1].name
                    : null
                }
                placement="right"
              >
                <IconButton
                  onClick={() => this.handleParentSeason(true)}
                  style={{ justifySelf: "flex-end", marginRight: "5px" }}
                >
                  <ArrowForwardIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <div
                className="MuiIconButton-root MuiButtonBase-root"
                style={{ justifySelf: "flex-end", marginRight: "5px" }}
              >
                <ArrowForwardIcon color="disabled" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

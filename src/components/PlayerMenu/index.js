import React, { Component } from "react";

import { Button, Divider, Menu, MenuItem } from "@material-ui/core";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";

export default class PlayerMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuAnchor: false,
      ...props.state,
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleClick(evt) {
    this.setState({
      menuAnchor: evt.currentTarget,
    });
  }

  handleClose(evt) {
    this.setState({
      menuAnchor: false,
    });
  }

  render() {
    let { auth, id, isAndroid, isIOS, metadata, server } = this.state;

    let mobileUrl;
    const streamURL = new URL(
      `${server}/api/v1/redirectdownload/${encodeURIComponent(
        metadata.name
      )}?a=${auth}&id=${id}`
    );
    if (isAndroid) {
      const scheme = streamURL.protocol.slice(0, -1);
      streamURL.hash = `Intent;action=android.intent.action.VIEW;scheme=${scheme};type=${
        metadata.mimeType
      };S.title=${encodeURIComponent(metadata.name)};end`;
      streamURL.protocol = "intent";
      mobileUrl = streamURL.toString();
    } else if (isIOS) {
      streamURL.host = "x-callback-url";
      streamURL.port = "";
      streamURL.pathname = "stream";
      streamURL.search = `url=${server}/api/v1/redirectdownload/${encodeURIComponent(
        metadata.name
      )}?a=${auth}&id=${id}`;
      streamURL.protocol = "vlc-x-callback";
      mobileUrl = streamURL.toString();
    }

    return (
      <div className="info__button">
        <Button
          variant="outlined"
          color="primary"
          style={{ width: "135px" }}
          aria-controls="player-menu"
          aria-haspopup="true"
          onClick={this.handleClick}
          startIcon={<PlayCircleOutlineIcon />}
        >
          Player
        </Button>
        <Menu
          id="player-menu"
          anchorEl={this.state.menuAnchor}
          keepMounted
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}
          open={Boolean(this.state.menuAnchor)}
          onClose={this.handleClose}
        >
          <MenuItem
  onClick={async () => {
    try {
      // Construir la URL de redirección
      const redirectUrl = `${server}/api/v1/redirectdownload/${encodeURIComponent(metadata.name)}?a=${auth}&id=${id}`;

      // Crear un Intent
      const intentUri = `intent://#Intent;action=android.intent.action.VIEW;scheme=http;type=${metadata.mimeType};end`;

      // Intentar abrir la URL en un navegador web y permitir al usuario seleccionar la aplicación
      window.location.href = intentUri;
    } catch (error) {
      console.error('Error al abrir la URL:', error);
    }
  }}
>
  Reproductor
</MenuItem>

          <Divider />
          <MenuItem
            onClick={() => {
              navigator.clipboard.writeText(
                `${server}/api/v1/redirectdownload/${encodeURIComponent(
                  metadata.name
                )}?a=${auth}&id=${id}`
              );
              this.handleClose();
            }}
          >
            Copiar URL
          </MenuItem>
        </Menu>
      </div>
    );
  }
}

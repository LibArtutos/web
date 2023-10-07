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
const redirectURL = `${server}/api/v1/redirectdownload/${encodeURIComponent(metadata.name)}?a=${auth}&id=${id}`;

// Hacer la solicitud HTTP
fetch(redirectURL)
  .then(response => {
    if (response.ok) {
      return response.text(); // Puedes usar response.json() si esperas una respuesta JSON
    } else {
      throw new Error('Error en la solicitud HTTP');
    }
  })
  .then(data => {
    // Actualizar streamURL con la URL obtenida de la respuesta HTTP
    const newURL = new URL(data);
    
    if (isAndroid) {
      const scheme = newURL.protocol.slice(0, -1);
      newURL.hash = `Intent;action=android.intent.action.VIEW;scheme=${scheme};type=${metadata.mimeType};S.title=${encodeURIComponent(metadata.name)};end`;
      newURL.protocol = "intent";
    } else if (isIOS) {
      newURL.host = "x-callback-url";
      newURL.port = "";
      newURL.pathname = "stream";
      newURL.search = `url=${redirectURL}`;
      newURL.protocol = "vlc-x-callback";
    }
    
    streamURL = newURL.toString();
    mobileUrl = streamURL;
  })
  .catch(error => {
    console.error('Error al hacer la solicitud HTTP:', error);
  });

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
          {isAndroid || isIOS ? (
            <div>
              <a href={mobileUrl} className="no_decoration_link">
                <MenuItem onClick={this.handleClose}>
                  {isAndroid ? "Android" : isIOS ? "IOS selector" : null}
                </MenuItem>
              </a>
              <Divider />
            </div>
          ) : (
            <div>
              <a
                href={`potplayer://${server}/api/v1/redirectdownload/${encodeURIComponent(
                  metadata.name
                )}?a=${auth}&id=${id}`}
                className="no_decoration_link"
              >
                <MenuItem onClick={this.handleClose}>PotPlayer</MenuItem>
              </a>
            </div>
          )}
          <Divider />
          <MenuItem
              onClick={async () => {
                try {
                  // Realizar una solicitud HTTP a la URL generada
                  const response = await fetch(
                      `${server}/api/v1/redirectdownload/${encodeURIComponent(
                          metadata.name
                      )}?a=${auth}&id=${id}`
                  );

                  // Verificar si la solicitud fue exitosa
                  if (response.ok) {
                    // Obtener la URL de redirección de la respuesta
                    const redirectedUrl = response.url;

                    // Copiar la URL de redirección al portapapeles
                    navigator.clipboard.writeText(redirectedUrl);

                    // Cerrar la ventana emergente o menú
                    this.handleClose();
                  } else {
                    console.error('La solicitud no fue exitosa');
                  }
                } catch (error) {
                  console.error('Error al realizar la solicitud:', error);
                }
              }}
          >
            Copiar URL
          </MenuItem>
        </Menu>
      </div>
    );
  }
}

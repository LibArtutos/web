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
      // Construir la URL de redirección inicial
      const initialRedirectUrl = `${server}/api/v1/redirectdownload/${encodeURIComponent(metadata.name)}?a=${auth}&id=${id}`;

      // Realizar una solicitud HTTP para obtener la URL final
      const response = await fetch(initialRedirectUrl);

      if (response.ok) {
        // Obtener la URL final desde la cabecera de respuesta (puede variar según la API)
        const finalRedirectUrl = response.headers.get('final-redirect-url');

        if (finalRedirectUrl) {
          // Crear un Intent URI genérico para que el usuario elija la aplicación
          const intentUri = `intent://#Intent;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.android;end`;

          // Intentar abrir la URL final en cualquier aplicación compatible
          window.location.href = intentUri + `;S.url=${finalRedirectUrl}`;
        } else {
          console.error('No se pudo obtener la URL final de redirección.');
        }
      } else {
        console.error('La solicitud no fue exitosa');
      }
    } catch (error) {
      console.error('Error al realizar la solicitud o abrir la URL:', error);
    }
  }}
>
  Reproductor Externo
</MenuItem>


                
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

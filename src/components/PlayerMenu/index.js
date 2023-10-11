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
  onClick={() => {
    try {
      // Construir la URL de redirección
      const redirectUrl = `${server}/api/v1/redirectdownload/${encodeURIComponent(metadata.name)}?a=${auth}&id=${id}`;

      // Crear un Intent con la acción VIEW
      const intentUri = `intent:#Intent;action=android.intent.action.VIEW;S.url=${redirectUrl};end`;

      // Intentar abrir la URL en un navegador web específico (por ejemplo, Chrome)
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

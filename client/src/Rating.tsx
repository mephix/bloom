import React from 'react';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { ThumbUp, ThumbUpOutlined, Favorite, FavoriteBorderOutlined } from '@material-ui/icons';

import './assets/css/App.css';

type Props = {
  available_date: any;
  matching_user: any;
  rateDate: Function;
  restart: Function;
  redirectToApp: Function;
};

type State = {
  rated: boolean;
};

class Rating extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {rated: false};
  }

  render() {
    return (
      <React.Fragment>
        {this.state.rated ? (
          <div className="centered-container">
            <p>Do you want to go on another date?</p>
            <AppBar position="fixed" color="primary" className="bottom-bar">
              <Toolbar>
                <Button variant="contained" onClick={() => this.props.redirectToApp()}>No</Button>
                <Button variant="contained" color="primary" onClick={() => this.props.restart()}>Yes</Button>
              </Toolbar>
            </AppBar> 
          </div>
        ) : (
          <div className="centered-container">
            <p>Time’s up!</p>
            <div className="feedback">
              <p>Could you see and hear each other okay?</p>
              <IconButton color="primary" onClick={() => this.props.rateDate('fun', !this.props.available_date.data().fun)}>
                {this.props.available_date.data().fun ? (
                  <ThumbUp />
                ) : (
                  <ThumbUpOutlined />
                )}
              </IconButton>
            </div>
            <div className="feedback">
              <p>Do you want to exchange numbers with {this.props.matching_user.firstName}?</p>
              <IconButton color="primary" onClick={() => this.props.rateDate('heart', !this.props.available_date.data().heart)}>
                {this.props.available_date.data().heart ? (
                  <Favorite />
                ) : (
                  <FavoriteBorderOutlined />
                )}
              </IconButton>
            </div>
            <AppBar position="fixed" color="primary" className="bottom-bar">
              <Toolbar>
                <Button variant="contained" onClick={() => this.setState({rated: true})}>Done</Button>
              </Toolbar>
            </AppBar> 
          </div>
        )}
        
      </React.Fragment>
    );
  }
}

export default Rating;

import React from "react";
import Switch from "@material-ui/core/Switch";

type Props = {
  user: {
    email: string;
    here: boolean;
  };
  updateUser: Function;
};

class Toggle extends React.Component<Props> {
  render() {
    const {user} = this.props;
    if(!user) return null
    const {email, here} = user;
    const handleChange = () => {
      this.props.updateUser(email, {
        here: !here,
      });
    };
    return (
      <div className="toggle">
        <Switch
          checked={here}
          onChange={handleChange}
          inputProps={{ "aria-label": "secondary checkbox" }}
        />
      </div>
    );
  }
}

export default Toggle;

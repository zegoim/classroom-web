import * as React from "react";

export interface DynamicLoadProps {
  dynamicComponent?: Promise<any>;
  [key: string]: any;
}

export interface DynamicLoadState {
  mod?: any;
}

export default class DynamicLoad extends React.Component<DynamicLoadProps, DynamicLoadState> {
  state: DynamicLoadState = {
    mod: null
  };

  componentWillMount() {
    const { dynamicComponent, ...props } = this.props;
    if (dynamicComponent) {
      dynamicComponent
        .then(result => {
          const Mod = result.default;
          this.setState({ mod: Mod ? <Mod  {...props} /> : null });
        })
        .catch(err => {
          console.error(err);
          this.setState({
            mod: null
          });
        });
    }
  }

  render() {
    return this.state.mod;
  }
}

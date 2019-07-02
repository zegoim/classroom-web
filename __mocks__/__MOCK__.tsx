import * as React from "react";
import * as PropTypes from "prop-types";

export interface DataProps {}

export interface MockProps extends DataProps, React.HTMLAttributes<HTMLDivElement> {}

export class Mock extends React.Component<MockProps> {
  static contextTypes = { theme: PropTypes.object };
  context: { theme: ReactUWP.ThemeType };

  render() {
    const { ...attributes } = this.props;
    const { theme } = this.context;
    const styles = getStyles(this);
    const classes = theme.prepareStyles({
      className: "Mock",
      styles
    });

    return (
      <div
        {...attributes}
        {...classes.root}
      >
        Mock
      </div>
    );
  }
}

function getStyles(Mock: Mock) {
  const {
    context: { theme },
    props: { style }
  } = Mock;
  const { prefixStyle } = theme;

  return {
    root: prefixStyle({
      ...style
    })
  };
}

export default Mock;

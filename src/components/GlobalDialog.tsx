import * as React from "react";
import * as PropTypes from "prop-types";
import ContentDialog from "react-uwp/ContentDialog";
export interface DataProps {}
export interface GlobalDialogState {
  showStatusBarDialog?: boolean;
  dialogContent?: any;
}

export interface GlobalDialogProps extends DataProps, React.HTMLAttributes<HTMLDivElement> {}

export class GlobalDialog extends React.Component<GlobalDialogProps, GlobalDialogState> {
  static contextTypes = { theme: PropTypes.object };
  context: { theme: ReactUWP.ThemeType };
  state: GlobalDialogState = {};

  componentDidMount() {
    window._openDialog = (config?: { content?: any; onConfirm?: () => void; onCancel?: () => void }) => {
      this._onConfirm = config.onConfirm;
      this._onCancel = config.onCancel;
      this.setState({ dialogContent: config ? config.content : null, showStatusBarDialog: true });
    };
  }
  _onConfirm = () => {};
  _onCancel = () => {};

  toggleShowStatusBarDialog = (showStatusBarDialog?: any) => {
    if (typeof showStatusBarDialog === "boolean") {
      if (showStatusBarDialog !== this.state.showStatusBarDialog) {
        this.setState({ showStatusBarDialog });
      }
    } else {
      this.setState((prevState, prevProps) => ({
        showStatusBarDialog: !prevState.showStatusBarDialog
      }));
    }
  }

  render() {
    const { ...attributes } = this.props;
    const { theme } = this.context;
    const styles = getStyles(this);
    const classes = theme.prepareStyles({
      className: "GlobalDialog",
      styles
    });
    const { showStatusBarDialog, dialogContent } = this.state;

    return (
      <ContentDialog
        // statusBarTitle="错误信息"
        showCloseButton
        content={dialogContent}
        defaultShow={showStatusBarDialog}
        primaryButtonText="确定"
        secondaryButtonText="取消"
        primaryButtonAction={() => {
          this.toggleShowStatusBarDialog(false);
          if (this._onConfirm) this._onConfirm();
        }}
        secondaryButtonAction={() => {
          this.toggleShowStatusBarDialog(false);
          if (this._onCancel) this._onCancel();
        }}
        closeButtonAction={this.toggleShowStatusBarDialog}
        onCloseDialog={() => {
          this.setState({ showStatusBarDialog: false });
        }}
      />
    );
  }
}

function getStyles(GlobalDialog: GlobalDialog) {
  const {
    context: { theme },
    props: { style }
  } = GlobalDialog;
  const { prefixStyle } = theme;

  return {
    root: prefixStyle({
      ...style
    })
  };
}

export default GlobalDialog;

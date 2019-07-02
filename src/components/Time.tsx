import * as React from "react";
import * as PropTypes from "prop-types";
import * as moment from "moment";

export interface DataProps {}

export interface TimeProps extends React.HTMLAttributes<HTMLSpanElement>, DataProps {}

export class Time extends React.Component<TimeProps> {
  static contextTypes = { theme: PropTypes.object };
  context: { theme: ReactUWP.ThemeType };
  rootEl: HTMLSpanElement;

  startTime: Date;
  start = () => {
    this.startTime = new Date();
    this.timeNext();
  }

  timer: any = null;
  timeNext = () => {
    if (!this.startTime) {
      this.start();
    }
    clearTimeout(this.timer);
    const format = `hh:mm:ss`;
    const newTimestamp = Number(new Date());
    const prevTimestamp = Number(this.startTime);
    const offsetTimestamp = newTimestamp - prevTimestamp;

    const ms = Math.floor((offsetTimestamp % 1000) / 100);
    const s = Math.floor(offsetTimestamp / 1000) % 60;
    const m = Math.floor(offsetTimestamp / 1000 / 60) % 60;
    const h = Math.floor(offsetTimestamp / 1000 / 60 / 60);
    this.rootEl.innerText = `${[h, m, s].map(this.prefixTime).join(":")}.${ms}`;
    this.timer = setTimeout(this.timeNext, 100);
  }

  prefixTime = (time: number) => time < 10 ? `0${time}` : time;

  stop = () => {
    clearTimeout(this.timer);
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  render() {
    const {
      ...attributes
    } = this.props;
    const { theme } = this.context;
    const styles = getStyles(this);
    const classes = theme.prepareStyles({
      className: "Time",
      styles
    });

    return (
      <span {...attributes} {...classes.root} ref={rootEl => this.rootEl = rootEl}>
        00:00:00
      </span>
    );
  }
}

function getStyles(Time: Time) {
  const {
    context: { theme },
    props: { style }
  } = Time;
  const { prefixStyle } = theme;

  return {
    root: prefixStyle({
      position: "fixed", right: 20, bottom: 20, background: theme.accent,
      color: "#fff",
      padding: "4px 12px",
      fontSize: 14,
      ...style
    })
  };
}

export default Time;

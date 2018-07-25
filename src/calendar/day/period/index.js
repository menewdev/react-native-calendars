import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  TouchableWithoutFeedback,
  Text,
  View
} from 'react-native';
import {shouldUpdate} from '../../../component-updater';
import isEqual from 'lodash.isequal';

import * as defaultStyle from '../../../style';
import styleConstructor from './style';

class Day extends Component {
  static propTypes = {
    // TODO: selected + disabled props should be removed
    state: PropTypes.oneOf(['selected', 'disabled', 'past', 'today', '']),

    // Specify theme properties to override specific styles for calendar parts. Default = {}
    theme: PropTypes.object,
    marking: PropTypes.any,

    onPress: PropTypes.func,
    onLongPress: PropTypes.func,
    date: PropTypes.object,

    markingExists: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.theme = {...defaultStyle, ...(props.theme || {})};
    this.style = styleConstructor(props.theme);
    this.markingStyle = this.getDrawingStyle(props.marking || []);
    this.onDayPress = this.onDayPress.bind(this);
    this.onDayLongPress = this.onDayLongPress.bind(this);
  }

  onDayPress() {
    this.props.onPress(this.props.date);
  }

  onDayLongPress() {
    this.props.onLongPress(this.props.date);
  }

  shouldComponentUpdate(nextProps) {
    const newMarkingStyle = this.getDrawingStyle(nextProps.marking);

    if (!isEqual(this.markingStyle, newMarkingStyle)) {
      this.markingStyle = newMarkingStyle;
      return true;
    }

    if (this.props.state !== 'past' && this.props.theme.fadeOthers != nextProps.theme.fadeOthers) {
      return true;
    }

    return shouldUpdate(this.props, nextProps, ['state', 'children', 'onPress', 'onLongPress']);
  }

  getDrawingStyle(marking) {
    const defaultStyle = {textStyle: {}};
    if (!marking) {
      return defaultStyle;
    }
    if (marking.disabled) {
      defaultStyle.textStyle.color = this.theme.textDisabledColor;
    } else if (marking.selected) {
      defaultStyle.textStyle.color = this.theme.selectedDayTextColor;
    }
    const resultStyle = ([marking]).reduce((prev, next) => {
      if (next.quickAction) {
        if (next.first || next.last) {
          prev.containerStyle = this.style.firstQuickAction;
          prev.textStyle = this.style.firstQuickActionText;
          if (next.endSelected && next.first && !next.last) {
            prev.rightFillerStyle = '#c1e4fe';
          } else if (next.endSelected && next.last && !next.first) {
            prev.leftFillerStyle = '#c1e4fe';
          }
        } else if (!next.endSelected) {
          prev.containerStyle = this.style.quickAction;
          prev.textStyle = this.style.quickActionText;
        } else if (next.endSelected) {
          prev.leftFillerStyle = '#c1e4fe';
          prev.rightFillerStyle = '#c1e4fe';
        }
        return prev;
      }

      const color = next.color;
      if (next.status === 'NotAvailable') {
        prev.textStyle = this.style.naText;
      }
      if (next.startingDay) {
        prev.startingDay = {
          color
        };
      }
      if (next.endingDay) {
        prev.endingDay = {
          color
        };
      }
      if (!next.startingDay && !next.endingDay) {
        prev.day = {
          color
        };
      }
      if (next.textColor) {
        prev.textStyle.color = next.textColor;
      }
      return prev;
    }, defaultStyle);
    return resultStyle;
  }

  render() {
    const containerStyle = [this.style.base];
    const textStyle = [this.style.text];
    let leftFillerStyle = {};
    let rightFillerStyle = {};
    let fillerStyle = {};
    let fillers;
    let theme = this.props.theme;

    if (this.props.state === 'disabled') {
      textStyle.push(this.style.disabledText);
    } else if (this.props.state === 'today') {
      containerStyle.push(this.style.today);
      // textStyle.push(this.style.todayText);
      if (this.props.day === 0) {
        textStyle.push({ color: theme.fadeOthers ? theme.subSundayTextColor : theme.mainSundayTextColor });
      } else if (this.props.day === 6) {
        textStyle.push({ color: theme.fadeOthers ? theme.subSaturdayTextColor : theme.mainSaturdayTextColor });
      } else {
        textStyle.push({ color: theme.fadeOthers ? theme.subTextColor : theme.mainTextColor });
      }
    } else if (this.props.state === 'past') {
      if (this.props.day === 0) {
        textStyle.push({ color: theme.pastSundayTextColor });
      } else if (this.props.day === 6) {
        textStyle.push({ color: theme.pastSaturdayTextColor });
      } else {
        textStyle.push({ color: theme.pastTextColor });
      }
    } else {
      if (this.props.day === 0) {
        textStyle.push({ color: theme.fadeOthers ? theme.subSundayTextColor : theme.mainSundayTextColor });
      } else if (this.props.day === 6) {
        textStyle.push({ color: theme.fadeOthers ? theme.subSaturdayTextColor : theme.mainSaturdayTextColor });
      } else {
        textStyle.push({ color: theme.fadeOthers ? theme.subTextColor : theme.mainTextColor });
      }
    }

    if (this.props.marking) {
      containerStyle.push({
        borderRadius: 22
      });

      const flags = this.markingStyle;
      if (flags.textStyle) {
        textStyle.push(flags.textStyle);
      }
      if (flags.containerStyle) {
        containerStyle.push(flags.containerStyle);
      }
      if (flags.leftFillerStyle) {
        leftFillerStyle.backgroundColor = flags.leftFillerStyle;
      }
      if (flags.rightFillerStyle) {
        rightFillerStyle.backgroundColor = flags.rightFillerStyle;
      }

      if (flags.startingDay && !flags.endingDay) {
        leftFillerStyle = {
          backgroundColor: (this.props.state === 'past') ? theme.pastBackgroundColor : theme.calendarBackground
        };
        rightFillerStyle = {
          backgroundColor: flags.startingDay.color
        };
        containerStyle.push({
          backgroundColor: flags.startingDay.color
        });
      } else if (flags.endingDay && !flags.startingDay) {
        rightFillerStyle = {
          backgroundColor: (this.props.state === 'past') ? theme.pastBackgroundColor : theme.calendarBackground
        };
        leftFillerStyle = {
          backgroundColor: flags.endingDay.color
        };
        containerStyle.push({
          backgroundColor: flags.endingDay.color
        });
      } else if (flags.day) {
        if (this.props.state === 'past' && !this.props.marking.selected) {
          containerStyle.push({ backgroundColor: theme.pastBackgroundColor });
          leftFillerStyle = { backgroundColor: theme.pastBackgroundColor };
          rightFillerStyle = { backgroundColor: theme.pastBackgroundColor };
          fillerStyle = { backgroundColor: theme.pastBackgroundColor };
        } else {
          leftFillerStyle = {backgroundColor: flags.day.color};
          rightFillerStyle = {backgroundColor: flags.day.color};
          // #177 bug
          fillerStyle = {backgroundColor: flags.day.color};
        }
      } else if (flags.endingDay && flags.startingDay) {
        rightFillerStyle = {
          backgroundColor: (this.props.state === 'past') ? theme.pastBackgroundColor : theme.calendarBackground
        };
        leftFillerStyle = {
          backgroundColor: (this.props.state === 'past') ? theme.pastBackgroundColor : theme.calendarBackground
        };
        containerStyle.push({
          backgroundColor: flags.endingDay.color
        });
      }

      fillers = (
        <View style={[this.style.fillers, fillerStyle]}>
          <View style={[this.style.leftFiller, leftFillerStyle]}/>
          <View style={[this.style.rightFiller, rightFillerStyle]}/>
        </View>
      );
    }

    return (
      <TouchableWithoutFeedback
        onPress={this.onDayPress}
        onLongPress={this.onDayLongPress}>
        <View style={this.style.wrapper}>
          {fillers}
          <View style={containerStyle}>
            <Text allowFontScaling={false} style={textStyle}>{String(this.props.children)}</Text>
            {this.props.marking.checked && <View style={{ width: 4, height: 4, marginTop: 1, borderRadius: 2, backgroundColor: "white" }}/>}
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

export default Day;

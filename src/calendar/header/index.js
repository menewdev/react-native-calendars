import React, { Component } from 'react';
import { ActivityIndicator } from 'react-native';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import XDate from 'xdate';
import PropTypes from 'prop-types';
import styleConstructor from './style';
import { weekDayNames } from '../../dateutils';

class CalendarHeader extends Component {
  static propTypes = {
    theme: PropTypes.object,
    hideArrows: PropTypes.bool,
    month: PropTypes.instanceOf(XDate),
    addMonth: PropTypes.func,
    showIndicator: PropTypes.bool,
    firstDay: PropTypes.number,
    renderArrow: PropTypes.func,
    hideDayNames: PropTypes.bool,
    weekNumbers: PropTypes.bool,
    onPressArrowLeft: PropTypes.func,
    onPressArrowRight: PropTypes.func
  };

  static defaultProps = {
    monthFormat: 'MMMM yyyy',
  };

  constructor(props) {
    super(props);
    this.style = styleConstructor(props.theme);
    this.addMonth = this.addMonth.bind(this);
    this.substractMonth = this.substractMonth.bind(this);
    this.onPressLeft = this.onPressLeft.bind(this);
    this.onPressRight = this.onPressRight.bind(this);
  }

  addMonth() {
    this.props.addMonth(1);
  }

  substractMonth() {
    this.props.addMonth(-1);
  }

  shouldComponentUpdate(nextProps) {
    if (
      nextProps.month.toString('yyyy MM') !==
      this.props.month.toString('yyyy MM')
    ) {
      return true;
    }
    if (nextProps.showIndicator !== this.props.showIndicator) {
      return true;
    }
    if (nextProps.hideDayNames !== this.props.hideDayNames) {
      return true;
    }
    return false;
  }

  onPressLeft() {
    const {onPressArrowLeft} = this.props;
    if(typeof onPressArrowLeft === 'function') {
      return onPressArrowLeft(this.substractMonth);
    }
    return this.substractMonth();
  }

  onPressRight() {
    const {onPressArrowRight} = this.props;
    if(typeof onPressArrowRight === 'function') {
      return onPressArrowRight(this.addMonth);
    }
    return this.addMonth();
  }

  renderWeekDayName = (day, idx) => {
    let style = this.style.dayHeader
    if (idx === 0) {
      style = [style, { color: this.props.theme.mainSundayTextColor }];
    } else if (idx === 6) {
      style = [style, { color: this.props.theme.mainSaturdayTextColor }];
    }
    return (
      <Text allowFontScaling={false} key={idx} accessible={false} style={style} numberOfLines={1} importantForAccessibility='no'>{day}</Text>
    );
  }

  render() {
    let leftArrow = <View />;
    let rightArrow = <View />;
    let weekDaysNames = weekDayNames(this.props.firstDay);
    if (!this.props.hideArrows) {
      leftArrow = (
        <TouchableOpacity
          onPress={this.onPressLeft}
          style={this.style.arrow}
          hitSlop={{left: 20, right: 20, top: 20, bottom: 20}}
        >
          {this.props.renderArrow
            ? this.props.renderArrow('left')
            : <Image
                source={require('../img/previous.png')}
                style={this.style.arrowImage}
              />}
        </TouchableOpacity>
      );
      rightArrow = (
        <TouchableOpacity
          onPress={this.onPressRight}
          style={this.style.arrow}
          hitSlop={{left: 20, right: 20, top: 20, bottom: 20}}
        >
          {this.props.renderArrow
            ? this.props.renderArrow('right')
            : <Image
                source={require('../img/next.png')}
                style={this.style.arrowImage}
              />}
        </TouchableOpacity>
      );
    }
    return (
      <View>
        <View style={this.style.header}>
          {leftArrow}
          <View style={{ flexDirection: 'column', alignItems: 'center' }}>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 9,
                fontFamily: this.style.monthText.fontFamily,
                color: this.props.theme.mainTextColor,
                marginBottom: -3
              }}
            >
              {this.props.month.toString('yyyy')}
            </Text>
            <Text allowFontScaling={false} style={this.style.monthText} accessibilityTraits='header'>
              {this.props.month.toString(this.props.monthFormat)}
            </Text>
          </View>
          {rightArrow}
        </View>
        {
          !this.props.hideDayNames &&
          <View style={this.style.week}>
            {this.props.weekNumbers && <Text allowFontScaling={false} style={this.style.dayHeader}></Text>}
            {weekDaysNames.map(this.renderWeekDayName)}
          </View>
        }
      </View>
    );
  }
}

export default CalendarHeader;

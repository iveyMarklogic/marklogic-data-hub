import React, {useState} from "react";
import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import "./DateRangePicker.scss";

type Props = {
  calendarIcon?: React.ReactNode;
  value: []
  onChange: () => {}
}

const DateRangePickerWrapper: React.FC<Props> = ({value, onChange,...otherProps}) => {

  return (
    <DateRangePicker
      className="dateRangePickerCustom"
      format="yyyy-MM-dd"
      rangeDivider="~"
      dayPlaceholder="DD"
      monthPlaceholder="MM"
      yearPlaceholder="YYYY"
      onChange={onChange}
      value={value}
      {...otherProps}
    />
  );
};

export default DateRangePickerWrapper;
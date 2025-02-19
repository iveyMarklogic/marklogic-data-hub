import React, {useState, useEffect, useRef, useCallback} from "react";
import Select, {components as SelectComponents} from "react-select";
import reactSelectThemeConfig from "@config/react-select-theme.config";
import styles from "./dropdownWithSearch.module.scss";
import arrayIcon from "../../../assets/icon_array.png";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch} from "@fortawesome/free-solid-svg-icons";
import HCTooltip from "../hc-tooltip/hc-tooltip";

interface Props{
  setDisplaySelectList?:((displaySelectList: boolean) => void) | any;
  setDisplayMenu:(displayMenu:boolean) => void;
  onItemSelect:(itemSelect:any) => void;
  indentList?:Array<any>;
  srcData:Array<any>;
  modelling?:boolean;
  itemValue:string;
}
const DropDownWithSearch: React.FC<Props> = (props) => {
  const {setDisplaySelectList, setDisplayMenu, onItemSelect, indentList, modelling, srcData, itemValue} = props;
  const node: any = useRef();
  const [selList, setSelList] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [eventValid, setEventValid] = useState(false);

  //handle callback from event listeners
  const handleOuterClick = useCallback(
    e => {
      if (node.current && !node.current.contains(e.target)) {
        setDisplaySelectList(false);
        setDisplayMenu(false);
        setEventValid(prev => false);
      }
    }, []
  );

  const charToPxScalingFactor = 9;
  const maxWidth = 400;
  const minWidth = 168;

  // calculates width of dropdown in 'px' based on length of displayed elements
  const calcDropdownWidth = () => {
    if (indentList && srcData) {
      let maxStringLengthInPx = 0;
      srcData.map((element, index) => maxStringLengthInPx = Math.max(maxStringLengthInPx, element.value.length * charToPxScalingFactor + indentList[index]));
      if (maxStringLengthInPx > maxWidth) return maxWidth.toString() + "px";
      if (maxStringLengthInPx < minWidth) return minWidth.toString() + "px";
      return maxStringLengthInPx.toString() + "px";
    }
    if (modelling) {
      let cardWidth = "204px";
      return cardWidth;
    }
    return minWidth.toString() + "px";
  };

  // truncates and adds ellipsis for dropdown text
  const formatDropdownText = (text, index) => {
    let indentVal;
    indentList ? indentVal = indentList[index] : indentVal = 0;
    if ((text.length * charToPxScalingFactor) + indentVal > maxWidth) {
      for (let i = text.length; i > 0; i--) {
        if (((i + 3) * charToPxScalingFactor) + indentVal < maxWidth) return text.substring(0, i) + "...";
      }
    }
    return text;
  };

  useEffect(() => {
    setSelList(true);
    setMenuVisible(true);
    if (setDisplaySelectList) {
      setEventValid(prev => true);
    }
  }, [setDisplaySelectList, setDisplayMenu]);

  //Handling click event outside the Dropdown Menu
  useEffect(() => {
    if (eventValid) {
      document.addEventListener("click", handleOuterClick);
    }

    return () => {
      document.removeEventListener("click", handleOuterClick);
    };
  });

  const optionsStyle = (index) => {
    if (indentList) {
      return {lineHeight: "2vh", textOverflow: "clip", paddingLeft: indentList[index] + "px"};
    } else {
      return {lineHeight: "2vh", textOverflow: "clip"};
    }
  };

  const MenuList = (selector, props) => (
    <div id={`${selector}-select-MenuList`}>
      <SelectComponents.MenuList {...props} />
    </div>
  );

  const DropdownIndicator = innerProps => {
    return (
      <SelectComponents.DropdownIndicator {...innerProps}>
        <FontAwesomeIcon icon={faSearch} size="2x" className={styles.searchIcon} />
      </SelectComponents.DropdownIndicator>
    );
  };
  let selectedValue = {};
  const dropdownListOptions = srcData.map((element, index) => {
    let value = formatDropdownText(element.value, index);
    if (element.key && element.key === itemValue) {
      selectedValue = {
        value: element.key,
        testId: element.value,
        label: element.label ? element.label : value,
        index,
        struct: element.struct,
        isDisabled: element.isDisabled
      };
      return selectedValue;
    }
    return {
      value: element.key,
      testId: element.value,
      label: element.label ? element.label : value,
      index,
      struct: element.struct,
      isDisabled: element.isDisabled
    };
  });

  /* srcData requires an array of tuple instead of a flat array to handle duplicate values */
  return (
    <div ref={node}>
      {menuVisible && <Select
        id="dropdownList-select-wrapper"
        className={styles.wrapper}
        inputId="dropdownList-select"
        components={{MenuList: props => MenuList("dropdownList", props), DropdownIndicator}}
        menuIsOpen={selList}
        aria-label="dropdownList-select-wrapper"
        isSearchable
        value={selectedValue}
        onChange={onItemSelect}
        options={dropdownListOptions}
        formatOptionLabel={(element: any) => {
          return (
            <span data-testid={element.testId + "-option"} style={optionsStyle(element.index)} role={"option"}>
              {element.label}
              {<HCTooltip text="Multiple" data-testid={element.testId + "Multiple-option-tooltip"} id="multiple-option-tooltip" placement="top">
                <img data-testid={element.testId + "-optionIcon"} src={element.struct ? arrayIcon : ""} alt={""} />
              </HCTooltip>}
            </span>
          );
        }}
        styles={{
          ...reactSelectThemeConfig,
          container: (provided, state) => ({
            ...provided,
            width: calcDropdownWidth(),
          }),
        }}
      />}
    </div>
  );
};

export default DropDownWithSearch;

import React, {useState, useContext, useEffect} from "react";
import styles from "../facet/facet.module.scss";
import {stringConverter} from "@util/string-conversion";
import {MonitorContext} from "@util/monitor-context";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import PopOverSearch from "../pop-over-search/pop-over-search";
import {ChevronDown, ChevronRight} from "react-bootstrap-icons";
import {HCCheckbox, HCTooltip} from "@components/common";

interface Props {
    name: string;
    displayName: string;
    facetValues: any[];
    tooltip: string;
    updateSelectedFacets: (constraint: string, vals: string[], toDelete?: boolean, toDeleteAll?: boolean) => void;
    addFacetValues: (constraint: string, vals: string[]) => void;
}

const MonitorFacet: React.FC<Props> = (props) => {
  const SHOW_MINIMUM = 3;
  const SEARCH_MINIMUM = 20;

  const {monitorOptions, monitorGreyedOptions} = useContext(MonitorContext);
  const [showFacets, setShowFacets] = useState(SHOW_MINIMUM);
  const [show, toggleShow] = useState(true);
  const [more, toggleMore] = useState(false);
  const [checked, setChecked] = useState<string[]>([]);

  let checkedFacets: any[] = [];

  const setCheckedOptions = (selectedOptions) => {
    let facetName: string = "";
    if (selectedOptions.selectedFacets.hasOwnProperty(props.name)) {
      facetName = props.name;
    }
    if (facetName) {
      if (monitorOptions.selectedFacets.length === 0) { setChecked([]); }
      for (let facet in selectedOptions.selectedFacets) {
        if (facet === facetName) {
          const checkedArray = selectedOptions.selectedFacets[facet];
          if (checkedArray && checkedArray.length) {
            // checking if arrays are equivalent
            if (!(JSON.stringify(checked) === JSON.stringify(checkedArray))) {
              setChecked(checkedArray);
            }
          }
        }
      }
    } else {
      setChecked([]);
    }
  };

  const checkFacetValues = (checkedValues) => {
    let updatedChecked = [...checked];
    for (let value of checkedValues) {
      if (updatedChecked.indexOf(value) === -1) { updatedChecked.push(value); }
    }
    setChecked(updatedChecked);
    props.addFacetValues(props.name, updatedChecked);
  };

  const handleClick = (e) => {
    let index = checked.indexOf(e.target.value);
    // Selection
    if (e.target.checked && index === -1) {
      setChecked([...checked, e.target.value]);
      props.updateSelectedFacets(props.name, [...checked, e.target.value]);
    } else if (index !== -1) {     // Deselection
      let remChecked = [e.target.value];
      props.updateSelectedFacets(props.name, remChecked, true, false);
    }
  };


  const handleClear = () => {
    setChecked([]);
    props.updateSelectedFacets(props.name, checked, false, true);
  };

  if (props.facetValues.length === 0 && checked.length > 0) {
    checkedFacets = checked.map(item => {
      return {name: item, count: 0, value: item};
    });
  } else if (props.facetValues.length > 0) {
    checkedFacets = props.facetValues;
  }


  const showMore = () => {
    let toggle = !more;
    let showNumber = SHOW_MINIMUM;
    if (toggle && props.facetValues.length > SHOW_MINIMUM) {
      showNumber = props.facetValues.length;
    }
    toggleMore(!more);
    setShowFacets(showNumber);
  };

  useEffect(() => {
    if (Object.entries(monitorOptions.selectedFacets).length !== 0 && monitorOptions.selectedFacets.hasOwnProperty(props.name)) {
      setCheckedOptions(monitorOptions);
    } else if ((Object.entries(monitorGreyedOptions.selectedFacets).length === 0 || (!monitorGreyedOptions.selectedFacets.hasOwnProperty(props.name)))) {
      setChecked([]);
    }
  }, [monitorOptions]);

  useEffect(() => {
    if (Object.entries(monitorGreyedOptions.selectedFacets).length !== 0 && monitorGreyedOptions.selectedFacets.hasOwnProperty(props.name)) {
      setCheckedOptions(monitorGreyedOptions);
    } else { setCheckedOptions(monitorOptions); }
  }, [monitorGreyedOptions]);

  const checkFacetLabel = (value) => {
    // facet?.value.toLowerCase() === "ingestion" ? "Loading": stringConverter(props.displayName) === "step-type" ? facet.value[0].toUpperCase() + facet.value.substring(1) : facet.value.incluedes("completed") && !facet.value.includes("error") ? "Completed Successfully" : facet.value.includes("errors") ? "Completed With Errors" : facet.value.includes("canceled") ? "Canceled" facet.value

    if (value.toLowerCase() === "ingestion") {
      return "Loading";
    } else if (stringConverter(props.displayName) === "step-type") {
      return value[0].toUpperCase() + value.substring(1);
    } else if (stringConverter(props.displayName) === "status") {
      if (value.includes("completed") && (!value.includes("error"))) {
        return "Completed Successfully";
      } else if (value.includes("errors")) {
        return "Completed with Errors";
      } else if (value.includes("canceled")) {
        return "Canceled";
      } else if (value.includes("failed")) {
        return "Failed";
      }
    } else {
      return value;
    }
  };


  const checkBoxRender =  checkedFacets.slice(0, showFacets).map((facet, index) => {
    return (
      <div key={"facet" + index} className={styles.checkContainer}>
        <HCCheckbox
          id={"facet-" + facet.name + "-" + index}
          handleClick={(e) => handleClick(e)}
          value={facet.value}
          label={facet ? checkFacetLabel(facet.value) : ""}
          checked={checked.includes(facet.value)}
          dataTestId={`${stringConverter(props.displayName)}-${facet.value}-checkbox`}
          tooltip={facet?.value.toLowerCase() === "ingestion" ? "Loading": facet.value[0].toUpperCase() + facet.value.substring(1)}
        />
      </div>
    );
  });

  return (

    <div className={styles.facetContainer}
      style={{"marginLeft": "7px"}}
      data-testid={stringConverter(props.displayName) + "-facet"}
    >
      <div className={styles.header}>
        <div
          className={styles.name}
          data-testid={stringConverter(props.displayName) + "-facet"}
        >
          <HCTooltip text={props.displayName} id="display-name-tooltip" placement="top"><span>{props.displayName}</span></HCTooltip>
          <HCTooltip text={props.tooltip} id="info-tooltip" placement="top-start">
            <span>{props.tooltip ?
              <FontAwesomeIcon className={styles.infoIcon} icon={faInfoCircle} size="sm" data-testid={`info-tooltip-${props.name}`} /> : ""}
            </span>
          </HCTooltip>
        </div>
        <div className={styles.summary}>
          {checked.length > 0 ?
            <div className={styles.selected}
              data-cy={stringConverter(props.displayName) + "-selected-count"}
            >{checked.length} selected</div> : ""}
          <div
            className={(checked.length > 0 ? styles.clearActive : styles.clearInactive)}
            onClick={() => handleClear()}
            data-testid={stringConverter(props.displayName) + "-clear"}
            data-cy={stringConverter(props.displayName) + "-clear"}
          >Clear
          </div>
          <div className={styles.toggle} onClick={() => toggleShow(!show)}
            data-testid={stringConverter(props.displayName) + "-toggle"}
          >
            {show ? <ChevronDown aria-label="icon: chevron-down" className={styles.toggleIcon}/> : <ChevronRight aria-label="icon: chevron-right" className={styles.toggleIcon}/>}
          </div>
        </div>
      </div>
      <div style={{display: (show) ? "block" : "none"}}>
        {checkBoxRender}
        <div
          className={styles.more}
          style={{display: (props.facetValues.length > SHOW_MINIMUM) ? "block" : "none"}}
          onClick={() => showMore()}
          data-testid={`show-more-${stringConverter(props.displayName)}`}
        >{(more) ? "<< less" : "more >>"}</div>
      </div>
      {(checkedFacets.length >= SEARCH_MINIMUM) &&
        <div className={styles.searchValues}>
          <PopOverSearch
            referenceType={""}
            entityTypeId={""}
            propertyPath={""}
            checkFacetValues={checkFacetValues}
            popOvercheckedValues={checked}
            facetValues={checkedFacets}
            facetName={props.name}
          />
        </div>}
    </div>
  );


};

export default MonitorFacet;

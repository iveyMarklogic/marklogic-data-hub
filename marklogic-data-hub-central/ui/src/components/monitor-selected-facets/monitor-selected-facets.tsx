import React, {useContext} from "react";
import styles from "../selected-facets/selected-facets.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckSquare, faWindowClose} from "@fortawesome/free-solid-svg-icons";
import {MonitorContext} from "@util/monitor-context";
import {XLg} from "react-bootstrap-icons";
import {HCButton, HCTooltip} from "@components/common";

interface Props {
    selectedFacets: any[];
    greyFacets: any[];
    toggleApply: (clicked:boolean) => void;
    toggleApplyClicked: (clicked:boolean) => void;
    showApply: boolean
    applyClicked: boolean
}

export const MonitorSelectedFacets: (React.FC<Props>)  = (props) => {
  const {
    monitorGreyedOptions,
    monitorOptions,
    setAllMonitorFacets,
    clearAllMonitorGreyFacets,
    clearMonitorFacet,
    clearMonitorGreyFacet
  } = useContext(MonitorContext);

  const applyFacet = () => {
    let facets = {...monitorGreyedOptions.selectedFacets};
    for (let constraint in monitorOptions.selectedFacets) {
      if (facets.hasOwnProperty(constraint)) {
        if (constraint !== "startTime") {
          for (let sValue of monitorOptions.selectedFacets[constraint]) {
            if (facets[constraint].indexOf(sValue) === -1) {
              facets[constraint].push(sValue);
            }
          }
        }
      } else {
        facets[constraint] = monitorOptions.selectedFacets[constraint];
      }
    }
    setAllMonitorFacets(facets);
    clearAllMonitorGreyFacets();
    props.toggleApplyClicked(true);
    props.toggleApply(false);
  };

  const clearGreyFacets = () => {
    clearAllMonitorGreyFacets();
    props.toggleApplyClicked(true);
    props.toggleApply(false);
  };

  const unCheckRest = (constraint, facet) => {
    if (props.selectedFacets.length === 0) { return true; }
    for (let item of props.selectedFacets) {
      if (item.constraint === constraint && item.facet !== undefined && item.facet === facet) { return false; }
    }
    return true;
  };

  return (
    <div
      id="selected-facets"
      data-testid="selected-facet-block"
      data-cy="selected-facet-block"
      style={ (Object.entries(monitorOptions.selectedFacets).length === 0 && Object.entries(monitorGreyedOptions.selectedFacets).length === 0) ? {"visibility": "hidden"} : {"visibility": "visible"}}
    >
      { props.selectedFacets.map((item, index) => {
        let facetName = item.displayName ? item.displayName : item.constraint;
        let facetValue = item.constraint === "stepStatus" ? item.facet[0].toUpperCase() + item.facet.substring(1) : item.facet;
        let displayName = item.constraint !== "startTime" ? facetName + ": " + facetValue : facetValue;
        return (
          <HCButton
            size="sm"
            variant="outline-blue"
            className={styles.facetButton}
            key={index}
            onClick={() => clearMonitorFacet(item.constraint, item.facet)}
            data-cy={`clear-${item.facet}`}
            data-testid={`clear-${item.facet}`}
          >
            {displayName}
            <XLg className={styles.close}/>
          </HCButton>
        );
      })}
      {props.greyFacets.map((item, index) => {
        let facetName = item.displayName ? item.displayName : item.constraint;
        let facetValue = item.constraint === "stepStatus" ? item.facet[0].toUpperCase() + item.facet.substring(1) : item.facet;
        let displayName = item.constraint !== "startTime" ? facetName + ": " + facetValue : facetValue;
        return (
          (unCheckRest(item.constraint, item.facet)) &&
          <HCTooltip
            id={index + "-" + item.facet}
            key={index + "-" + item.facet}
            text={"Not yet applied"}
            placement="top"
          >
            <HCButton
              size="sm"
              className={styles.facetGreyButton}
              key={index}
              onClick={() => clearMonitorGreyFacet(item.constraint, item.facet)}
              data-cy={`clear-grey-${item.facet}`}
              data-testid={`clear-grey-${item.facet}`}
            >
              {displayName}
              <XLg className={styles.close}/>
            </HCButton>
          </HCTooltip>
        );
      })}
      {props.greyFacets.length > 0 &&
            <HCTooltip text={"Clear unapplied facets"} id="clear-facets-tooltip" placement="top">
              <i><FontAwesomeIcon
                icon={faWindowClose}
                onClick={clearGreyFacets}
                data-cy="clear-all-grey-button"
                data-testid="clear-all-grey-button"
                className={styles.closeIcon}
                size="lg" /></i>
            </HCTooltip>
      }
      {props.greyFacets.length > 0 &&
            <HCTooltip text={"Apply facets"} id="apply-facets-tooltip" placement="top">
              <i><FontAwesomeIcon
                icon={faCheckSquare}
                onClick={() => applyFacet()}
                size="lg"
                className={styles.checkIcon}
                data-cy="facet-apply-button"
                data-testid="facet-apply-button"
              /></i>
            </HCTooltip>
      }
    </div>
  );

};


export default MonitorSelectedFacets;

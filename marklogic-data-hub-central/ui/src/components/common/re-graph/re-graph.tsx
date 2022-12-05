import {expandGroupNode} from "@api/queries";
import React, {useState, useEffect} from "react";
import {Chart, FontLoader} from "regraph";
import styles from "./re-graph.module.scss";

function ContextMenu(props) {
  const {menu, selection, showRelated, collapseRelated, selectall} = props;
  if (!menu.visible) {
    return null;
  }
  const menuItems: any[] = [];

  if (menu.expanded) {
    menuItems.push(
      {onClick: collapseRelated, text: "Collapse related nodes"},
    );
  } else {
    menuItems.push(
      {onClick: showRelated, text: "Show related nodes"},
    );
  }

  return (
    <div className={styles.menu} style={{left: menu.x + 1, top: menu.y + 1}}>
      {menuItems.map((menuItem) => (
        <div key={menuItem.text} className={styles.menuItem} onClick={() => menuItem.onClick(menu.id)}>
          {menuItem.text}
        </div>
      ))}
    </div>
  );
}

function Tooltip(props) {
  const {message, x, y} = props;
  return (
    <div className={styles.tooltip} style={{left: x, top: y}}>
      <div className={styles.tooltipArrow} />
      <div className={styles.tooltipContent}>
        <span className={styles.tooltipMessages}>
          {message}
        </span>
      </div>
    </div>
  );
}


const userFontIcon = {text: "fa-bell", color: "#000"};

interface Props {
  data: any;
  config: any
}

const ReGraph: React.FC<Props> = ({data, config}) => {
  const [chartData, setChartData] = useState({});
  const [expandedNodes, setExpandedNodes] = useState({});
  const defaultMenu = {visible: false, x: 0, y: 0, id: null, expanded: false};
  const [menu, setMenu] = useState(defaultMenu);
  const [tooltipData, setTooltipData] = useState({
    message: null,
    position: {x: 0, y: 0},
  });

  function createNodes(rawData) {
    let nodes = {};
    if (rawData?.nodes) {
      rawData.nodes.map((node) => {
        let entityType = node.group.split("/").pop();
        let entity: any = {};
        if (!node.isConcept) {
          entity = config?.modeling?.entities[entityType];
        } else {
          let conceptClassName = node.conceptClassName;
          if (conceptClassName && config?.modeling?.concepts[conceptClassName]) {
            entity = config?.modeling?.concepts[conceptClassName];
          }
        }

        nodes[node.id] = {
          label: {text: node.label, center: false},
          color: entity.color ? entity.color : "#2dcda8",
          fontIcon: userFontIcon,
          data: node,
        };
        if (node.hasRelationships) {
          nodes[node.id]["glyphs"] = [
            {
              position: "ne",
              color: "rgba(0, 0, 0, 0)",
              fontIcon: {text: "fa-credit-card", color: "#000"},
            },
          ];
        }
      });
    }

    if (rawData?.edges) {
      rawData.edges.map((edge) => {
        nodes[edge.id] = {
          id1: edge.from,
          id2: edge.to,
          color: "#606d7b",
          width: 4,
        };
      });
    }
    return (nodes);
  }
  const isMounted = React.useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (isMounted.current && data) {
      const nodes = createNodes(data);
      setChartData(nodes);
      setExpandedNodes({});
      setMenu(defaultMenu);
    }
  }, [data]);

  const showRelated = (id) => {
    expand({id});
  };

  async function expand({id}) {
    if (!id) return;
    const {data} = chartData[id];
    if (data.hasRelationships) {
      let payload = {
        database: "final",
        data: {
          parentIRI: id
        }
      };
      if (data.isConcept) {
        payload["data"]["isConcept"] = true;
        payload["data"]["parentIRI"] = "";
        payload["data"]["objectConcept"] = id;
      }
      try {
        let response: any;
        response = await expandGroupNode(payload);
        if (response.status === 200) {
          const newNodes = createNodes(response.data);
          const filteredNodes = {...newNodes};
          Object.keys(newNodes).map((key) => {
            if (chartData[key]) {
              delete filteredNodes[key];
            }
          });
          setChartData({...chartData, ...filteredNodes});
          setExpandedNodes({...expandedNodes, [id]: filteredNodes});
        }
      } catch (error) {
        console.log(error);
      }

    }
  }

  async function collapseRelated(id) {
    if (!id) return;
    if (expandedNodes[id]) {
      const tempExpandedNodes = {...expandedNodes};
      const nodesToDelete = expandedNodes[id];
      const newChartData = {...chartData};
      const keys = Object.keys(nodesToDelete);
      while (keys.length > 0) {
        const key = keys.shift();
        if (key && newChartData[key]) {
          if (expandedNodes[key]) {
            keys.unshift(...Object.keys(expandedNodes[key]));
            delete tempExpandedNodes[key];
          }
          delete newChartData[key];
        }
      }

      setChartData(newChartData);
      delete tempExpandedNodes[id];
      setExpandedNodes(tempExpandedNodes);
    }
  }



  const openContextMenu = ({id, x: xClickPos, y: yClickPos}) => {
    if (id === null) {
      if (menu.visible) {
        setMenu(defaultMenu);
      }
      return;
    }
    if (!chartData[id]?.data?.hasRelationships) {
      setMenu(defaultMenu);
      return;
    }
    if (expandedNodes[id]) {
      setMenu({visible: true, x: xClickPos, y: yClickPos, id: id, expanded: true});
    } else {
      setMenu({visible: true, x: xClickPos, y: yClickPos, id: id, expanded: false});
    }

  };
  // prevent the browser context menu appearing
  const suppressBrowserContextMenu = (evt) => {
    evt.preventDefault();
  };
  const handleKeyDown = (evt) => {
    if (evt.key === "Escape") {
      setMenu(defaultMenu);
    }
  };

  const updateTooltip = ({id, x, y}) => {
    const item = chartData[id];
    if (item && item.data && item.data.id) {
      setTooltipData({
        message: item.data.id,
        position: {x, y},
      });
    } else {
      setTooltipData({
        message: null,
        position: {x: 0, y: 0},
      });
    }
  };

  return (
    <div className={styles.reGraphContainer}>
      <h1>Re-graph</h1>

      <div
        style={{width: "100%", height: "100%", position: "relative"}}
        onContextMenu={suppressBrowserContextMenu}
        onKeyDown={handleKeyDown}
        onClick={() => setMenu(defaultMenu)}
      >

        <FontLoader config={{custom: {families: ["Font Awesome 5 Free"]}}}>
          <Chart items={chartData}
            options={{
              iconFontFamily: "Font Awesome 5 Free",
              imageAlignment: {
                "fa-user": {size: 0.9},
                "fa-university": {size: 0.9},
                "fa-exclamation-circle": {size: 0.9},
                "fa-users": {size: 0.85},
              },
              navigation: true,
              overview: false,
            }}
            onDoubleClick={expand}
            onContextMenu={openContextMenu}
            onPointerMove={updateTooltip}
          />
        </FontLoader>
        <ContextMenu menu={menu} showRelated={showRelated} collapseRelated={collapseRelated} />
        {tooltipData.message && !menu.visible && (
          <Tooltip x={tooltipData.position.x} y={tooltipData.position.y} message={tooltipData.message} />
        )}
      </div>
    </div>
  );
};

export default ReGraph;

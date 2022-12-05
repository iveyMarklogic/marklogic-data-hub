import React, {useEffect, useState} from "react";
import {Chart, FontLoader} from "regraph";
import styles from "./re-graph-modeling.module.scss";

const glyph = {
  color: "#00423e",
  label: {
    color: "#f5f7fa",
    backgroundColor: "#00423e",
    bold: true,
    center: true,
    text: "+",
  },
  size: 1.2,
};




const linkStyleStart = {
  color: "#606d7b",
  end2: {arrow: true},
  flow: {
    velocity: 1
  },
};
const linkStyleEnd = {
  color: "#606d7b",
  end2: {arrow: true},
  width: 2,
};

function generateLink(id1, id2) {
  return {
    ...linkStyleEnd,
    id1,
    id2,
  };
}

function generateLinkId(id1, id2, salt) {
  return `${id1}_${id2}_${salt}`;
}

interface Props {
  data: any;
  config: any;
}

const ModelingReGraph: React.FC<Props> = ({data, config}) => {
  console.log("🚀 ~ file: re-graph-modeling.tsx:51 ~ data", data)
  const [selectedNode, setSelectedNode] = useState(null);
  const [state, setState] = useState({
    positions: {},
    items: {},
    originId: null,
  });

  const getEdges = (data) => {
    let edges: any = [];
    data.forEach((e, i) => {
      if (e.model.definitions) {
        if (!e.model.definitions[e.entityName]) {
          return [];
        }

        let title = "Edit Relationship";

        let properties: any = Object.keys(e.model.definitions[e.entityName].properties);
        properties.forEach((p, i) => {
          let pObj = e.model.definitions[e.entityName].properties[p];
          let relationshipName = p;
          if (relationshipName.length > 20) {
            relationshipName = relationshipName.substring(0, 20) + "...";
            if (title !== undefined) title = p + "\n" + title;
          }
          //for one to one edges
          if (pObj.relatedEntityType) {
            let parts = pObj.relatedEntityType.split("/");
            edges.push({
              from: e.entityName,
              to: parts[parts.length - 1],
              label: relationshipName,
              predicate: p,
              joinPropertyName: pObj.joinPropertyName,
              id: e.entityName + "-" + p + "-" + parts[parts.length - 1] + "-via-" + pObj.joinPropertyName,
              title: title,
              arrowStrikethrough: true,
              color: "#666",
            });
            //for one to many edges
          } else if (pObj.items?.relatedEntityType) {
            let parts = pObj.items.relatedEntityType.split("/");
            edges.push({
              from: e.entityName,
              to: parts[parts.length - 1],
              label: relationshipName,
              predicate: p,
              joinPropertyName: pObj.items.joinPropertyName,
              id: e.entityName + "-" + p + "-" + parts[parts.length - 1] + "-via-" + pObj.items.joinPropertyName,
              title: title,
              arrowStrikethrough: true,
              color: "#666",
              font: {align: "top"}
            });
          }
        });
        if (e.model.definitions[e.entityName].hasOwnProperty("relatedConcepts")) {
          let relatedConcepts: any = e.model.definitions[e.entityName].relatedConcepts;
          relatedConcepts.forEach(obj => {
            let relationshipName = obj.predicate;
            if (relationshipName.length > 20) {
              relationshipName = relationshipName.substring(0, 20) + "...";
              if (title !== undefined) title = obj.relationshipName + "\n" + title;
            }
            edges.push({
              from: e.entityName,
              to: obj.conceptClass,
              label: relationshipName,
              predicate: obj.predicate,
              joinPropertyName: obj.context,
              id: e.entityName + "-" + obj.predicate + "-" + obj.conceptClass + "-via-" + obj.context,
              title: title,
              arrowStrikethrough: true,
              color: "#666",
              font: {
                align: "top",
              },
              conceptExpression: obj.conceptExpression
            });
          });
        }
      }
    });
    return edges;
  };


  useEffect(() => {
    if (data && Array.isArray(data) && data.length > 0) {
      const nodes = {};
      data.map((node) => {
        if (node["entityName"]) {
          nodes[node["entityName"]] = {
            fontIcon: {
              text: "fa-bell",   // or '\u{f007}'
              fontFamily: "Font Awesome 5 Free"
            },
            label: {
              color: "#2e3842",
              backgroundColor: "transparent",
              text: node["entityName"],
              center: false
            },
            color: config["modeling"]["entities"][node["entityName"]] ? config["modeling"]["entities"][node["entityName"]].color : "#2dcda8",
            glyphs: [glyph],
          };
        }
        if (node["conceptName"]) {
          nodes[node["conceptName"]] = {
            label: {
              color: "#2e3842",
              backgroundColor: "transparent",
              text: node["conceptName"],
              center: false
            },
            border: {
              color: "#00423e",
              lineStyle: "dashed",
              width: 2
            },
            color: config["modeling"]["concepts"][node["conceptName"]] ? config["modeling"]["concepts"][node["conceptName"]].color : "#000",
          };
        }
      });
      const edges = getEdges(data);
      if (edges) {
        edges.map((edge) => {
          nodes[edge.id] = {
            id1: edge.from,
            id2: edge.to,
            color: "#606d7b",
            width: 2,
            label: {
              text: edge.label,
              bold: true,
              backgroundColor: "#fff",
            },
            end2: {
              arrow: true
            },
          };
        });
      }
      //check if nodes is an empty object
      if (Object.keys(nodes).length !== 0) {
        setState({...state, items: nodes});
      }
    }
  }, [data]);



  const {originId, positions} = state;

  const handleDragStart = ({id: nextOriginId, subItem, setDragOptions}) => {
    if (subItem && subItem.type === "glyph" && subItem.index === 0) {
      // Save the id of the node that initiated the drag
      setState((current) => {
        return {...current, originId: nextOriginId};
      });

      setDragOptions({
        // Create a temporary link dragger
        dummyLink: linkStyleStart,
      });
    }
  };

  const handleDragEnd = ({id}) => {
    if (!originId || id === originId) {
      return;
    }

    setState((current) => {
      // Create a new link between the origin and target items
      const newLinkId = generateLinkId(originId, id, Object.keys(current.items).length);
      const newLink = generateLink(originId, id);
      return {
        ...current,
        items: {...current.items, [newLinkId]: newLink},
        originId: null,
      };
    });
  };

  const handleChange = (params) => {
    const {positions: nextPositions} = params;
    if (nextPositions) {
      setState((current) => {
        return {...current, positions: nextPositions};
      });
    }
  };

  const handleClick = ({id}) => {
    if (!id) {
      if (selectedNode) {
        setSelectedNode(null);
      }
      return;
    }
    setSelectedNode(id);
  };
  const handleClose = () => {
    setSelectedNode(null);
  };

  const {items} = state;

  const chart = (
    <Chart
      animation={{animate: false, time: 0}}
      items={items}
      positions={positions}
      options={{
        fit: "none",
        navigation: true,
        overview: true,
      }}
      onClick={handleClick}
      onChange={handleChange}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
    />
  );

  return (
    <div className="h-100 position-relative d-flex">
      <FontLoader config={{custom: {families: ["Font Awesome 5 Free"]}}}>
        <div className={selectedNode ? "w-75" : "w-100"}>
          {chart}
        </div>

        {selectedNode &&
          <div className="w-25 p-3" style={{borderLeft: "1px solid #ccc"}}>
            <div className="w-100 d-flex justify-content-between">
              <span>this is the left panel</span>
              <a className={styles.closeButton} onClick={handleClose}>
                X
              </a>
            </div>
            <h2>Id: {selectedNode}</h2>
          </div>
        }
      </FontLoader >
    </div >
  );
};

export default ModelingReGraph;
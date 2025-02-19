import React from "react";
import styles from "./detail-header.module.scss";
import {dateConverter} from "@util/date-conversion";
import {ChevronRight} from "react-bootstrap-icons";

interface Props {
  document: any;
  contentType: string;
  primaryKey: string;
  uri: string;
  sources: any;
}

const DetailHeader: React.FC<Props> = (props) => {
  const recordType = props.contentType;
  let envelope: any = {};
  let esEnvelope: any = {};
  let title: string = "";
  let primaryKey: string = "";
  let id: string = "";
  let timestamp: string = "";
  let sources: string = "";

  if (props.sources && props.sources.length) {
    sources = props.sources.map(src => {
      return src.datahubSourceName;
    }).join(", ");
  }

  if (recordType === "json") {
    if (props.document.envelope) {
      envelope = props.document.envelope;
      if (envelope && envelope.instance) {
        if (envelope.instance.hasOwnProperty("info")) {
          title = envelope.instance.info.hasOwnProperty("title") && envelope.instance.info.title;
        }
        if (envelope.hasOwnProperty("headers")) {
          if (typeof (envelope.headers.createdOn) === "object") {
            timestamp = envelope.headers.hasOwnProperty("createdOn") && envelope.headers.createdOn[0];
          } else {
            timestamp = envelope.headers.hasOwnProperty("createdOn") && envelope.headers.createdOn;
          }
        }
        if (props.primaryKey && props.primaryKey !== props.uri) {
          Object.keys(props.document.envelope.instance).forEach(instance => {
            if (instance !== "info") {
              Object.keys(props.document.envelope.instance[instance]).forEach(function (key) {
                if (props.primaryKey.toString() === props.document.envelope.instance[instance][key].toString()) {
                  primaryKey = key;
                  id = props.document.envelope.instance[instance][key];
                }
              });
            }
          });
        } else {
          id = props.uri;
        }
      }
    }
  } else if (recordType === "xml") {
    if (props.document.envelope) {
      envelope = props.document.envelope;
      if (envelope && envelope.instance) {
        if (envelope.hasOwnProperty("headers")) {
          timestamp = envelope.headers.hasOwnProperty("createdOn") && envelope.headers.createdOn;
        }
        if (envelope.instance.hasOwnProperty("info")) {
          title = envelope.instance.info.hasOwnProperty("title") && envelope.instance.info.title;
        }
        if (props.primaryKey && props.primaryKey !== props.uri) {
          Object.keys(props.document.envelope.instance).forEach(instance => {
            if (instance !== "info") {
              Object.keys(props.document.envelope.instance[instance]).forEach(function (key) {
                if (props.primaryKey.toString() === props.document.envelope.instance[instance][key].toString()) {
                  primaryKey = key;
                  id = props.document.envelope.instance[instance][key];
                }
              });
            }
          });
        } else {
          id = props.uri;
        }
      }
    } else {
      esEnvelope = props.document["es:envelope"];
      if (esEnvelope) {
        if (esEnvelope.hasOwnProperty("es:headers")) {
          timestamp = esEnvelope["es:headers"].hasOwnProperty("createdOn") && esEnvelope["es:headers"].createdOn[0];
        }
        if (esEnvelope["es:instance"].hasOwnProperty("es:info")) {
          title = esEnvelope["es:instance"]["es:info"].hasOwnProperty("es:title") && esEnvelope["es:instance"]["es:info"]["es:title"];
        }
        if (props.primaryKey) {
          Object.keys(esEnvelope["es:instance"]).forEach(instance => {
            if (instance !== "info") {
              Object.keys(esEnvelope["es:instance"][instance]).forEach(function (key) {
                if (props.primaryKey === esEnvelope["es:instance"][instance][key]) {
                  primaryKey = key;
                  id = esEnvelope["es:instance"][instance][key];
                }
              });
            }
          });
        } else {
          id = props.uri;
        }
      }
    }
  }

  return (
    <div id="header" className={styles.container}>
      <div id="title" className={styles.title}>
        {primaryKey || id ?
          <>
            <span data-cy="document-title">{title} </span>
            <ChevronRight className={styles.arrowRight} />
            {primaryKey ? (
              <>
                <span className={styles.secondary}> {primaryKey}: </span>
                <span data-cy="document-id">{id}</span>
              </>
            ) : (
              <>
                <span className={styles.secondary}> URI: </span>
                <span data-cy="document-uri">{id}</span>
              </>
            )}
          </>
          : ""
        }

      </div>
      <div id="summary" className={styles.summary}>
        {timestamp &&
          <span className={styles.meta} data-cy="document-timestamp"><span className={styles.secondary}>Created: </span>{dateConverter(timestamp)}</span>
        }
        {sources &&
          <span className={styles.meta} data-cy="document-source"><span className={styles.secondary}>Sources: </span>{sources}</span>
        }
        {recordType &&
          <span className={styles.meta}>
            <span className={styles.secondary}>Record Type: </span>
            <span className={styles.type} data-cy="document-recordtype">{recordType}</span>
          </span>
        }
      </div>
    </div>
  );
};

export default DetailHeader;

/**
 Copyright (c) 2021 MarkLogic Corporation

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
'use strict';
declareUpdate();
const entitySearchLib = require("/data-hub/5/entities/entity-search-lib.sjs");
const test = require("/test/test-helper.xqy");

function verifyMetadataForDocumentWithAllMetadata() {
  let response = {
    "snippet-format": "snippet",
    "total": 1,
    "results": [
      {
        "index": 1,
        "uri": "/content/sally.json",
      }
    ]
  };

  let expectedSources = [{"datahubSourceName":"loadData"}, {"datahubSourceName":"someOtherName"}];

  xdmp.invokeFunction(function() {
    declareUpdate();
    xdmp.documentSetMetadata("/content/sally.json",
        {
          "datahubCreatedByStep": "map-step",
          "datahubCreatedInFlow": "CurateCustomerJSON",
          "datahubCreatedOn": "2020-10-08T15:14:28.772612-07:00"
        });
  });
  entitySearchLib.addDocumentMetadataToSearchResults(response);
  return[
    test.assertEqual("CurateCustomerJSON", response.results[0].hubMetadata.lastProcessedByFlow),
    test.assertEqual("map-step", response.results[0].hubMetadata.lastProcessedByStep),
    test.assertEqual("2020-10-08T15:14:28.772612-07:00", response.results[0].hubMetadata.lastProcessedDateTime),
    test.assertEqual(expectedSources, response.results[0].hubMetadata.sources)
  ];
}

function verifyMetadataForDocumentWithoutMetadata() {
  let response = {
    "snippet-format": "snippet",
    "total": 1,
    "results": [
      {
        "index": 1,
        "uri": "/content/jane.json",
      }
    ]
  };
  entitySearchLib.addDocumentMetadataToSearchResults(response);
  return[
      test.assertEqual(0, Object.keys(response.results[0].hubMetadata).length)
  ];
}

function verifyMetadataForDocumentWithPartialMetadata() {
  let response = {
    "snippet-format": "snippet",
    "total": 1,
    "results": [
      {
        "index": 1,
        "uri": "/content/tim.json",
      }
    ]
  };

  xdmp.invokeFunction(function() {
    declareUpdate();
    xdmp.documentSetMetadata("/content/tim.json",
        {
          "datahubCreatedByStep": "map-step"
        });
  });
  entitySearchLib.addDocumentMetadataToSearchResults(response);
  return[
    test.assertEqual(null, response.results[0].hubMetadata.lastProcessedByFlow),
    test.assertEqual("map-step", response.results[0].hubMetadata.lastProcessedByStep),
    test.assertEqual(null, response.results[0].hubMetadata.lastProcessedDateTime),
    test.assertEqual(null, response.results[0].hubMetadata.sources)
  ];
}

function verifyDocumentSizes() {
  let response = {
    "snippet-format": "snippet",
    "total": 3,
    "results": [
      {
        "index": 1,
        "uri": "/content/5KB.png",
      },
      {
        "index": 2,
        "uri": "/content/1MB.png",
      },
      {
        "index": 3,
        "uri": "/content/jane.json",
      }
    ]
  };
  entitySearchLib.addDocumentMetadataToSearchResults(response);
  return [
    test.assertEqual(5, response.results[0].documentSize.value),
    test.assertEqual("KB", response.results[0].documentSize.units),
    test.assertEqual(1, response.results[1].documentSize.value),
    test.assertEqual("MB", response.results[1].documentSize.units),
    test.assertEqual(207, response.results[2].documentSize.value),
    test.assertEqual("B", response.results[2].documentSize.units)
  ]
}

function verifySourcesIsArray() {
  let response = {
    "snippet-format": "snippet",
    "total": 2,
    "results": [
      {
        "index": 1,
        "uri": "/content/sally.json"
      },
      {
        "index": 2,
        "uri": "/content/recordWithSourcesObject.json"
      }
    ]
  };

  entitySearchLib.addDocumentMetadataToSearchResults(response);
  return[
    test.assertTrue(Array.isArray(response.results[0].hubMetadata.sources)),
    test.assertTrue(Array.isArray(response.results[1].hubMetadata.sources))
  ];
}

[]
    .concat(verifyMetadataForDocumentWithAllMetadata())
    .concat(verifyMetadataForDocumentWithoutMetadata())
    .concat(verifyMetadataForDocumentWithPartialMetadata())
    .concat(verifyDocumentSizes())
    .concat(verifySourcesIsArray());

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

const Artifacts = require('/data-hub/5/artifacts/core.sjs');
const config = require("/com.marklogic.hub/config.sjs")
const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const matcher = require('/com.marklogic.smart-mastering/matcher.xqy');
const httpUtils = require("/data-hub/5/impl/http-utils.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");

function get(context, params) {
  return post(context, params, null);
}

function post(context, params, input) {
  let inputBody = input ? input.root || {} : {};
  let inputOptions = inputBody.options || {};
  const datahub = DataHubSingleton.instance({
    performanceMetrics: !!inputOptions.performanceMetrics
  });
  let uri = params.uri;
  let inMemDocument = inputBody.document;
  if (!(uri || inMemDocument)) {
    httpUtils.throwBadRequestWithArray(['Bad Request', 'A valid uri parameter or document in the POST body is required.']);
  }
  let refFlowName = params.flowName;
  if (!refFlowName) {
    httpUtils.throwBadRequestWithArray(['Bad Request', 'A flow name must be provided.']);
  }
  let refStepNumber = params.step || '1';
  let flow = Artifacts.getFullFlow(refFlowName, refStepNumber);
  let stepRef = flow.steps[refStepNumber];
  if (!(stepRef.stepDefinitionType.toLowerCase() == 'mastering' || stepRef.stepDefinitionType.toLowerCase() == 'matching')) {
    httpUtils.throwBadRequestWithArray(['Bad Request', `The step referenced must be a matching step. Step type: ${stepRef.stepDefinitionType}`]);
  }
  let stepDetails = datahub.flow.stepDefinition.getStepDefinitionByNameAndType(stepRef.stepDefinitionName, stepRef.stepDefinitionType);
  // build combined options
  let flowOptions = flow.options || {};
  let stepRefOptions = stepRef.options || {};
  let stepDetailsOptions = stepDetails.options || {};
  let combinedOptions = Object.assign({}, stepDetailsOptions, flowOptions, stepRefOptions, inputOptions, params);
  let sourceDatabase = combinedOptions.sourceDatabase || config.STAGINGDATABASE;
  let matchOptions = new NodeBuilder().addNode(combinedOptions.matchOptions ? { options: combinedOptions.matchOptions }: combinedOptions).toNode();
  return fn.head(hubUtils.invokeFunction(
    function() {
      let doc = uri ? cts.doc(uri) : inMemDocument;
      return matcher.resultsToJson(matcher.findDocumentMatchesByOptions(
        doc,
        matchOptions,
        fn.number(params.start || 1),
        fn.number(params.pageLength || 20),
        params.includeMatchDetails === 'true',
        cts.trueQuery()
      ));
    },
    sourceDatabase
  ));
}

exports.GET = get;
exports.POST = post;

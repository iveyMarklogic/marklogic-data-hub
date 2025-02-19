const test = require("/test/test-helper.xqy");

const pma = require("/data-hub/5/mastering/preview-matching-activity-lib.xqy");

let allUris = [
  "/content/CustMatchMerge1.json",
  "/content/CustMatchMerge2.json",
  "/content/CustShippingCityStateMatch1.json",
  "/content/CustShippingCityStateMatch2.json",
  "/content/CustShippingCityStateMatch3.json",
  "/content/CustShippingCityStateMatch4.json"
];

const options = cts.doc("/steps/matching/matchCustomers.step.json").root;
const sourceQuery = xdmp.eval(options.sourceQuery);

const results = [];

const verifyPrimaryKeys = function(result) {
  const resultObj = result.toObject();
  const allURIs = [];
  for (let action of resultObj.actionPreview) {
    for (let uri of action.uris) {
      if (!allURIs.includes(allURIs)) {
        allURIs.push(uri);
        results.push(test.assertEqual(fn.string(cts.doc(uri).toObject().envelope.instance.Customer.customerId) || uri, resultObj.primaryKeys[uri], `Unexpected primary key value! primaryKeys: ${xdmp.toJsonString(resultObj.primaryKeys)}`));
      }
    }
  }
};

let allUrisResults = pma.previewMatchingActivity(options, sourceQuery, allUris, false, true, 0);
verifyPrimaryKeys(allUrisResults);
results.push(test.assertEqual(6, allUrisResults.actionPreview.length, "There should be 6 non-matching pairs where at least one rule is true."));

let uris0_1 = [allUris[0] , allUris[1]];
let uris_0_1_Results = pma.previewMatchingActivity(options, sourceQuery, uris0_1, false, true, 0);
verifyPrimaryKeys(uris_0_1_Results);
results.push(test.assertEqual(2, uris_0_1_Results.uris.length, "There should be 2 URIs in the response's URIs array for non-match on docs 0 and 1"));
results.push(test.assertEqual(0, uris_0_1_Results.actionPreview.length, "There should be only zero non-matching pairs for non-match on docs 0 and 1"));

let uris2_3 = [allUris[2] , allUris[3]];
let uris_2_3_Results = pma.previewMatchingActivity(options, sourceQuery, uris2_3, false, true, 0);
verifyPrimaryKeys(uris_2_3_Results);
results.push(test.assertEqual(2, uris_2_3_Results.uris.length, "There should be 2 URIs in the response's URIs array for match on docs 2 and 3"));
results.push(test.assertEqual(1, uris_2_3_Results.actionPreview.length, `There should be 1 non-matching pair for match on docs 2 and 3. actionPreview: ${xdmp.toJsonString(uris_2_3_Results.actionPreview)}`));
results.push(test.assertEqual("7.5", uris_2_3_Results.actionPreview[0].score.toString(), "For match with docs 1 and 2, the score should be 7.5"));

let uris_2_3_ResultRestrictedToURIs = pma.previewMatchingActivity(options, sourceQuery, uris2_3, true, true, 0);
verifyPrimaryKeys(uris_2_3_ResultRestrictedToURIs);
results.push(test.assertEqual(2, uris_2_3_ResultRestrictedToURIs.uris.length, "There should be 2 URIs in the response's URIs array for match on docs 2 and 3"));
results.push(test.assertEqual(1, uris_2_3_ResultRestrictedToURIs.actionPreview.length, `There should be 1 non-matching pair for match on docs 2 and 3 when not including the entire dataset. actionPreview: ${xdmp.toJsonString(uris_2_3_ResultRestrictedToURIs.actionPreview)}`));
results.push(test.assertEqual("7.5", uris_2_3_ResultRestrictedToURIs.actionPreview[0].score.toString(), "For match with docs 2 and 3, the last score should be 7.5"));

let sampleResults = pma.previewMatchingActivity(options, sourceQuery, [], false, true, 3);
verifyPrimaryKeys(sampleResults);
results.push(test.assertEqual(3, sampleResults.uris.length, "There should be 3 URIs in the response's URIs array when sampleSize is 3"));

results;

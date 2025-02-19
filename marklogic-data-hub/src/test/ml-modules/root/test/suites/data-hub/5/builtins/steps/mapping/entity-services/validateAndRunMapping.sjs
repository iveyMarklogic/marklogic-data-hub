const esMappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const test = require("/test/test-helper.xqy");

const entityType = "http://marklogic.com/data-hub/example/CustomerType-0.0.1/CustomerType";

// Convenience function for simplifying tests
function validateAndRunGenderMapping(sourcedFrom) {
  return esMappingLib.validateAndTestMapping({
    targetEntityType: entityType,
    properties: {
      gender: {sourcedFrom: sourcedFrom}
    }}, "/content/mapTest.json");


}
// The first 4 tests are same as validateMapping.sjs, there are being run to ensure validateAndTestMapping() returns
// the same result as well.
function validMapping() {
  let sourcedFrom = "memoryLookup(customer/gender, '{\"m\": \"Male\", \"f\": \"Female\", \"nb\": \"Non-Binary\"}')";
  let result = validateAndRunGenderMapping(sourcedFrom);
  return [
      test.assertEqual("Female", result.properties.gender.output,
        "'gender' should correctly be mapped to the expected value"),
      test.assertEqual(null, result.properties.gender.errorMessage,
        "An errorMessage shouldn't exist since the mapping expression is valid")
    ];
}

function unrecognizedProperty() {
  let result = esMappingLib.validateAndTestMapping({
    targetEntityType: entityType,
    properties: {
      genderr: {sourcedFrom: "gender"}
    }
  }, "/content/mapTest.json");
  return [
    test.assertEqual(null, result.properties.genderr.errorMessage,
      "Per DHFPROD-3627, an error shouldn't be thrown for an unrecognized property")
  ];
}

function missingFunctionReference() {
  let result = validateAndRunGenderMapping("memoryLookupp()");
  return [
    test.assertEqual("Unable to find function: 'memoryLookupp()'. Cause: Either the function does not exist or the wrong number of arguments were specified.", result.properties.gender.errorMessage)
  ];
}

function incorrectNumberOfFunctionArguments() {
  let result = validateAndRunGenderMapping("memoryLookup(gender)");
  return [
    test.assertEqual("Unable to find function: 'memoryLookup()'. Cause: Either the function does not exist or the wrong number of arguments were specified.", result.properties.gender.errorMessage,
      "If an incorrect number of function arguments are included, then the XSLT validation treats this as the function not being recognized")
  ];
}

function testvalidateAndTestMapping(mapURI = "/mappings/PersonMapping/PersonMapping-3.mapping.json", uri = "/content/person2.json") {
  let map = cts.doc(mapURI).toObject();
  let result = esMappingLib.validateAndTestMapping(map, uri);
  return [
    test.assertEqual(222, fn.number(result.properties.id.output), `Expected output '222', got '${xdmp.describe(result.properties.id)}'`),
    test.assertEqual("Middle", result.properties.name.properties.middle.output, `Expected output 'Middle', got '${xdmp.describe(result.properties.name.properties.middle)}'`),
    test.assertEqual("Last", result.properties.name.properties.last.output, `Expected output 'Last', got '${xdmp.describe(result.properties.name.properties.last)}'`),
    test.assertEqual("First", result.properties.name.properties.first.properties.value.output, `Expected output 'First', got '${xdmp.describe(result.properties.name.properties.first.properties.value)}'`),
    test.assertEqual("SomePrefix", result.properties.name.properties.first.properties.prefix.output, `Expected output 'SomePrefix', got '${xdmp.describe(result.properties.name.properties.first.properties.prefix)}'`)
  ];
}

function testvalidateAndTestMappingArrayValues(mapURI = "/mappings/OrdersMapping/OrdersMapping-3.mapping.json", uri = "/content/orderTest.json") {
  let map = cts.doc(mapURI).toObject();
  let result = esMappingLib.validateAndTestMapping(map, uri);
  return [
    test.assertEqual(1, fn.number(result.properties.id.output), `Expected output '1', got '${xdmp.describe(result.properties.id)}'`),
    test.assertEqualJson(["Voltsillam", "Latlux", "Biodex","Fixflex", "Keylex"], result.properties.items.properties.name.output, `Expected output ["Voltsillam", "Latlux", "Biodex","Fixflex", "Keylex"], got '${xdmp.describe(result.properties.items.properties.name)}'`),
    test.assertEqualJson(["7", "10", "2", "6", "3"], result.properties.items.properties.quantity.output, `Expected output ["7", "10", "2", "6", "3"], got '${xdmp.describe(result.properties.items.properties.quantity)}'`),
    test.assertEqualJson(["2", "7.17", "5.01", "8.77", "5.57"], result.properties.items.properties.price.output, `Expected output ["2", "7.17", "5.01", "8.77", "5.57"], got '${xdmp.describe(result.properties.items.properties.price)}'`),
  ];
}

function testvalidateAndTestMappingWithErrors() {
  let map = {
              "targetEntityType": "http://marklogic.com/data-hub/example/Person-1.0.0/Person",
              "properties": {
                "id": {"sourcedFrom": "concat(theNickname,'-ID')"}
              }
            };
  let uri = "/content/person2.json";
  let result = esMappingLib.validateAndTestMapping(map, uri);
  return [
    test.assertEqual("Data type mismatch. Cause: Returned type value (\"Nicky-ID\") from a mapping expression does not match expected property type (int).", result.properties.id.errorMessage, "Error thrown since int prop is mapped to string"),
  ];
}

function testValidateAndTestMappingWithDash(mapURI = "/mappings/PersonMapping/PersonDashMapping.mapping.json", uri = "/content/person2.json") {
  let map = cts.doc(mapURI).toObject();
  let result = esMappingLib.validateAndTestMapping(map, uri);
  return [
    test.assertEqual(222, fn.number(result.properties.id.output), `Expected output '222', got '${xdmp.describe(result.properties)}'`),
    test.assertEqual("Middle", result.properties["full-naming"]["properties"]["middle-names"]["output"], `Expected output 'Middle', got '${xdmp.describe(result.properties["full-naming"]["properties"]["middle-names"]["output"])}'`),
    test.assertEqual("Last", result.properties["full-naming"]["properties"]["last-name"]["output"], `Expected output 'Last', got '${xdmp.describe(result.properties["full-naming"]["properties"]["last-name"]["output"])}'`),
    test.assertEqual("First", result.properties["full-naming"]["properties"]["first-name"]["properties"]["value"]["output"], `Expected output 'First', got '${xdmp.describe(result.properties["full-naming"]["properties"]["first-name"]["properties"]["value"]["output"])}'`),
    test.assertEqual("SomePrefix", result.properties["full-naming"]["properties"]["first-name"]["properties"]["prefix"]["output"], `Expected output 'SomePrefix', got '${xdmp.describe(result.properties["full-naming"]["properties"]["first-name"]["properties"]["prefix"]["output"])}'`)
  ];
}

[]
  .concat(validMapping())
  .concat(unrecognizedProperty())
  .concat(missingFunctionReference())
  .concat(incorrectNumberOfFunctionArguments())
  .concat(testvalidateAndTestMapping())
  .concat(testvalidateAndTestMappingArrayValues())
  .concat(testValidateAndTestMappingWithDash())
  .concat(testvalidateAndTestMapping("/mappings/PersonNsMapping/PersonNsMapping-1.mapping.json", "/content/person-ns.xml"))
  // Test JSON to XML scenario
  .concat(testvalidateAndTestMapping("/mappings/PersonMapping/PersonMapping-3.mapping.json", "/content/json-to-xml.xml"))
  .concat(testvalidateAndTestMappingWithErrors())
;


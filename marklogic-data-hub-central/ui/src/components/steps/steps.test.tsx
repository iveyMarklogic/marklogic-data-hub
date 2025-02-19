import React from "react";
import {fireEvent, render, wait, cleanup, screen} from "@testing-library/react";
import Steps from "./steps";
import axiosMock from "axios";
import mocks from "../../api/__mocks__/mocks.data";
import data from "../../assets/mock-data/curation/steps.data";
import StepsConfig from "../../config/steps.config";
import {ErrorTooltips} from "../../config/tooltips.config";

jest.mock("axios");

describe("Steps settings component", () => {

  beforeEach(() => {
    mocks.advancedAPI(axiosMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  test("Verify rendering of edit Load step, tab switching, discard dialog on cancel, saving", async () => {
    const {baseElement, getByText, getByLabelText, getAllByLabelText, getByPlaceholderText} = render(
      <Steps {...data.editLoad} />
    );

    expect(getByText("Loading Step Settings")).toBeInTheDocument();
    expect(getByLabelText("Close")).toBeInTheDocument();

    // Default Basic tab
    expect(getByText("Basic").closest("button")).toHaveClass("nav-link active");
    expect(getByText("Advanced").closest("button")).not.toHaveClass("nav-link active");
    expect(baseElement.querySelector("#name")).toHaveValue("AdvancedLoad");
    // Other Basic settings details tested in create-edit-*.test.tsx

    // Switch to Advanced tab
    await wait(() => {
      fireEvent.click(getByText("Advanced"));
    });
    expect(getByText("Basic").closest("button")).not.toHaveClass("nav-link active");
    expect(getByText("Advanced").closest("button")).toHaveClass("nav-link active");
    expect(getByPlaceholderText("Please enter target permissions")).toHaveValue("data-hub-common,read,data-hub-common,update");
    // Other Advanced settings details tested in advanced-settings.test.tsx

    // Change form content
    getByPlaceholderText("Please enter target permissions").focus();
    fireEvent.change(getByPlaceholderText("Please enter target permissions"), {target: {value: "data-hub-common,read"}});
    expect(getByPlaceholderText("Please enter target permissions")).toHaveValue("data-hub-common,read");
    getByPlaceholderText("Please enter target permissions").blur();

    // Switch to Basic tab and cancel
    await wait(() => {
      fireEvent.click(getByText("Basic"));
    });
    expect(getByText("Basic").closest("button")).toHaveClass("nav-link active");
    expect(getByText("Advanced").closest("button")).not.toHaveClass("nav-link active");

    fireEvent.click(getAllByLabelText("Cancel")[0]);

    // Verify discard dialog
    expect(getByText("Discard changes?")).toBeInTheDocument();
    expect(getByText("Yes")).toBeInTheDocument();
    expect(getByText("No")).toBeInTheDocument();

    const noButton = getByText("No");
    noButton.onclick = jest.fn();
    fireEvent.click(noButton);
    expect(noButton.onclick).toHaveBeenCalledTimes(1);

    const yesButton = getByText("Yes");
    yesButton.onclick = jest.fn();
    fireEvent.click(yesButton);
    expect(yesButton.onclick).toHaveBeenCalledTimes(1);

    // Save
    await wait(() => {
      fireEvent.click(getAllByLabelText("Save")[0]);
    });
    const saveButton = getAllByLabelText("Save")[0];
    saveButton.onclick = jest.fn();
    fireEvent.click(saveButton);
    expect(saveButton.onclick).toHaveBeenCalledTimes(1);

  });

  test("Verify rendering of edit Mapping step, tab disabling on form error, discard changes dialog on close", async () => {
    const {getByText, getByLabelText, getByPlaceholderText, getByTestId} = render(
      <Steps {...data.editMapping} />
    );

    expect(getByText("Mapping Step Settings")).toBeInTheDocument();
    expect(getByLabelText("Close")).toBeInTheDocument();

    // Mapping step has link to Details
    const detailsLink = getByLabelText("stepDetails");
    detailsLink.onclick = jest.fn();
    fireEvent.click(detailsLink);
    expect(detailsLink.onclick).toHaveBeenCalledTimes(1);

    // Default Basic tab
    expect(getByText("Basic").closest("button")).toHaveClass("nav-link active");
    expect(getByText("Advanced").closest("button")).not.toHaveClass("nav-link active");

    // Switch to Advanced tab, create error, verify other tab disabled
    await wait(() => {
      fireEvent.click(getByText("Advanced"));
    });
    expect(getByPlaceholderText("Please enter target permissions")).toHaveValue("data-hub-common,read,data-hub-common,update");
    fireEvent.change(getByPlaceholderText("Please enter target permissions"), {target: {value: "bad-value"}});
    expect(getByPlaceholderText("Please enter target permissions")).toHaveValue("bad-value");
    fireEvent.blur(getByPlaceholderText("Please enter target permissions"));

    //TODO: Test with reference rather than hardcoded string.
    expect(getByTestId("validationError")).toHaveTextContent("The format of the string is incorrect. The required format is role,capability,role,capability,....");

    expect(getByText("Basic").closest("button")).toHaveClass("nav-link disabled");
    fireEvent.mouseOver(getByText("Basic"));
    wait(() => expect(screen.getByText(ErrorTooltips.disabledTab)).toBeInTheDocument());

    // Fix error, verify other tab enabled
    getByPlaceholderText("Please enter target permissions").focus();
    fireEvent.change(getByPlaceholderText("Please enter target permissions"), {target: {value: "data-hub-common,read"}});
    expect(getByPlaceholderText("Please enter target permissions")).toHaveValue("data-hub-common,read");
    getByPlaceholderText("Please enter target permissions").blur();
    expect(getByTestId("validationError")).toHaveTextContent("");

    expect(getByText("Basic").closest("button")).not.toHaveClass("nav-link disabled");

    // Close dialog, verify discard changes confirm dialog
    await wait(() => {
      fireEvent.click(getByLabelText("Close"));
    });
    const yesButton =  screen.getByRole("button", {
      name: /Yes/i
    });
    const noButton =  screen.getByRole("button", {
      name: /No/i
    });
    expect(getByText("Discard changes?")).toBeInTheDocument();
    expect(yesButton).toBeInTheDocument();
    expect(noButton).toBeInTheDocument();


    noButton.onclick = jest.fn();
    fireEvent.click(noButton);
    expect(noButton.onclick).toHaveBeenCalledTimes(1);


    yesButton.onclick = jest.fn();
    fireEvent.click(yesButton);
    expect(yesButton.onclick).toHaveBeenCalledTimes(1);

  });

  test("Verify rendering of edit Matching step", async () => {
    const {getByText, getByLabelText} = render(
      <Steps {...data.editMatching} />
    );

    expect(getByText("Matching Step Settings")).toBeInTheDocument();
    expect(getByLabelText("Close")).toBeInTheDocument();
  });

  test("Verify rendering of edit Merging step", async () => {
    const {getByText, getByLabelText, getByTestId, queryByText} = render(
      <Steps {...data.editMerging} />
    );

    expect(getByText("Merging Step Settings")).toBeInTheDocument();
    expect(getByLabelText("Close")).toBeInTheDocument();

    // Additional collection change doesn't trigger Discard Changes alert (DHFPROD-6660)
    await wait(() => {
      fireEvent.click(getByText("Advanced"));
    });
    fireEvent.click(getByTestId("onMerge-edit"));
    await wait(() => {
      expect(getByLabelText("additionalColl-select-onMerge")).toBeInTheDocument();
    });
    let collectionInput = getByLabelText("additionalColl-select-onMerge")!;
    fireEvent.input(collectionInput, {target: {value: "newCollection"}});
    fireEvent.keyDown(collectionInput, {keyCode: 13, key: "Enter"});
    fireEvent.click(getByTestId("onMerge-keep"));
    expect(getByText("newCollection")).toBeInTheDocument();
    fireEvent.click(getByTestId("AdvancedMatching-cancel-settings"));
    expect(queryByText("Discard changes?")).not.toBeInTheDocument();

  });

  test("Verify rendering of Custom step", async () => {
    const {getByText, getByLabelText} = render(
      <Steps {...data.editCustom} />
    );

    expect(getByText("Custom Step Settings")).toBeInTheDocument();
    expect(getByLabelText("Close")).toBeInTheDocument();
  });

  test("Verify rendering of new Load step", async () => {
    const testName = "stepName";
    // New non-mapping steps have the following default collections: Step Name
    const {getByText, getByLabelText, getByPlaceholderText, getByTestId} = render(
      <Steps {...data.newLoad} />
    );

    expect(getByText("New Loading Step")).toBeInTheDocument();
    expect(getByLabelText("Close")).toBeInTheDocument();

    // Advanced tab disabled since Basic tab has empty required fields
    expect(getByText("Basic").closest("button")).toHaveClass("nav-link active");
    expect(getByText("Advanced").closest("button")).toHaveClass("nav-link disabled");

    // Enter required name
    const nameField = getByPlaceholderText("Enter name");
    expect(nameField).toBeInTheDocument();
    nameField.focus();
    fireEvent.change(nameField, {target: {value: testName}});
    expect(nameField).toHaveValue(testName);
    nameField.blur();

    // Switch to enabled Advanced tab, check default collections
    await wait(() => {
      fireEvent.click(getByText("Advanced"));
    });
    await(() => expect(getByTestId("defaultCollections-" + testName)).toBeInTheDocument());

    // Check other defaults
    expect(getByText("Target Database:")).toBeInTheDocument();
    expect(getByText(StepsConfig.stagingDb)).toBeInTheDocument();
    expect(getByText("Target Collections:")).toBeInTheDocument();
    const targetColl = document.querySelector(("#additionalColl"))!;
    expect(targetColl).toBeEmpty();
    expect(getByText("Target Permissions:")).toBeInTheDocument();
    expect(getByPlaceholderText("Please enter target permissions")).toHaveValue(StepsConfig.defaultTargetPerms);
    expect(getByText("Provenance Granularity:")).toBeInTheDocument();
    expect(getByText("Off")).toBeInTheDocument();
    expect(getByText("Batch Size:")).toBeInTheDocument();
    expect(getByPlaceholderText("Please enter batch size")).toHaveValue(StepsConfig.defaultBatchSize.toString());
    expect(getByLabelText("headers-textarea")).toBeEmpty();
    // Open text areas that are closed by default
    fireEvent.click(getByText("Interceptors"));
    expect(getByLabelText("interceptors-textarea")).toBeEmpty();
    fireEvent.click(getByText("Custom Hook"));
    expect(getByLabelText("customHook-textarea")).toBeEmpty();
  });

  test("Verify rendering of new Mapping step", async () => {
    const testName = "stepName";
    const testColl = "testCollection";
    const testEntity = "entityName";
    const {getByText, getByLabelText, getByPlaceholderText, getByTestId} = render(
      <Steps {...data.newMapping} />
    );

    expect(getByText("New Mapping Step")).toBeInTheDocument();
    expect(getByLabelText("Close")).toBeInTheDocument();

    // Advanced tab disabled since Basic tab has empty required fields
    expect(getByText("Basic").closest("button")).toHaveClass("nav-link active");
    expect(getByText("Advanced").closest("button")).toHaveClass("nav-link disabled");

    // Enter required name
    const nameField = getByPlaceholderText("Enter name");
    expect(nameField).toBeInTheDocument();
    nameField.focus();
    fireEvent.change(nameField, {target: {value: testName}});
    expect(nameField).toHaveValue(testName);
    nameField.blur();

    // Enter required source collection
    const collInput = document.querySelector((".rbt-input-main"))!;

    await(() => fireEvent.change(collInput, {target: {value: testColl}}));
    await(() => expect(collInput).toHaveValue(testColl));

    //Switch to enabled Advanced tab, check default collections
    fireEvent.click(getByText("Advanced"));
    await(() => expect(getByTestId("defaultCollections-" + testName)).toBeInTheDocument());
    await(() => expect(getByTestId("defaultCollections-" + testEntity)).toBeInTheDocument());

    // Check other defaults
    await(() => expect(getByText("Source Database:")).toBeInTheDocument());
    await(() => expect(getByText(StepsConfig.stagingDb)).toBeInTheDocument());
    await(() => expect(getByText("Target Database:")).toBeInTheDocument());
    await(() => expect(getByText(StepsConfig.finalDb)).toBeInTheDocument());
    await(() => expect(getByText("Target Permissions:")).toBeInTheDocument());
    await(() => expect(getByPlaceholderText("Please enter target permissions")).toHaveValue(StepsConfig.defaultTargetPerms));
    await(() => expect(getByText("Target Format:")).toBeInTheDocument());
    await(() => expect(getByText(StepsConfig.defaultTargetFormat)).toBeInTheDocument());
    await(() => expect(getByText("Provenance Granularity:")).toBeInTheDocument());
    await(() => expect(getByText("Off")).toBeInTheDocument());
    await(() => expect(getByText("Entity Validation:")).toBeInTheDocument());
    await(() => expect(getByText("Do not validate")).toBeInTheDocument());
    await(() => expect(getByText("Batch Size:")).toBeInTheDocument());
    await(() => expect(getByPlaceholderText("Please enter batch size")).toHaveValue(StepsConfig.defaultBatchSize.toString()));
    await(() => expect(getByLabelText("headers-textarea")).toBeEmpty());
    // Open text areas that are closed by default
    await(() => fireEvent.click(getByText("Interceptors")));
    await(() => expect(getByLabelText("interceptors-textarea")).toBeEmpty());
    await(() => fireEvent.click(getByText("Custom Hook")));
    await(() => expect(getByLabelText("customHook-textarea")).toBeEmpty());
  });

  test("Verify rendering of new Matching step", async () => {
    const testName = "stepName";
    const testColl = "testCollection";
    const {getByText, getAllByText, getByLabelText, getByPlaceholderText, getByTestId} = render(
      <Steps {...data.newMatching} />
    );

    expect(getByText("New Matching Step")).toBeInTheDocument();
    expect(getByLabelText("Close")).toBeInTheDocument();

    // Advanced tab disabled since Basic tab has empty required fields
    expect(getByText("Basic").closest("button")).toHaveClass("nav-link active");
    expect(getByText("Advanced").closest("button")).toHaveClass("nav-link disabled");

    // Enter required name
    const nameField = getByPlaceholderText("Enter name");
    await(() => expect(nameField).toBeInTheDocument());
    await(() => nameField.focus());
    fireEvent.change(nameField, {target: {value: testName}});
    expect(nameField).toHaveValue(testName);
    nameField.blur();

    // Enter required source collection
    const collInput = document.querySelector((".rbt-input-main"))!;
    await(() => fireEvent.change(collInput, {target: {value: testColl}}));
    await(() => expect(collInput).toHaveValue(testColl));

    // Switch to enabled Advanced tab, check default collections
    fireEvent.click(getByText("Advanced"));
    await(() => expect(getByTestId("defaultCollections-" + testName)).toBeInTheDocument());

    // Check other defaults
    await(() => expect(getByText("Source Database:")).toBeInTheDocument());
    await(() => expect(getAllByText(StepsConfig.finalDb)[0]).toBeInTheDocument());
    await(() => expect(getByText("Target Database:")).toBeInTheDocument());
    await(() => expect(getAllByText(StepsConfig.finalDb)[1]).toBeInTheDocument());
    await(() => expect(getByText("Target Permissions:")).toBeInTheDocument());
    await(() => expect(getByPlaceholderText("Please enter target permissions")).toHaveValue(StepsConfig.defaultTargetPerms));
    await(() => expect(getByText("Provenance Granularity:")).toBeInTheDocument());
    await(() => expect(getByText("Off")).toBeInTheDocument());
    await(() => expect(getByText("Batch Size:")).toBeInTheDocument());
    await(() => expect(getByPlaceholderText("Please enter batch size")).toHaveValue(StepsConfig.defaultBatchSize.toString()));
    // Open text areas that are closed by default
    await(() => fireEvent.click(getByText("Interceptors")));
    await(() => expect(getByLabelText("interceptors-textarea")).toBeEmpty());
    await(() => fireEvent.click(getByText("Custom Hook")));
    await(() => expect(getByLabelText("customHook-textarea")).toBeEmpty());
  });

  test("Verify rendering of new Merging step", async () => {
    const testName = "stepName";
    const testColl = "testCollection";
    const {getByText, getAllByText, getByLabelText, getByPlaceholderText} = render(
      <Steps {...data.newMerging} />
    );

    expect(getByText("New Merging Step")).toBeInTheDocument();
    expect(getByLabelText("Close")).toBeInTheDocument();

    // Advanced tab disabled since Basic tab has empty required fields
    expect(getByText("Basic").closest("button")).toHaveClass("nav-link active");
    expect(getByText("Advanced").closest("button")).toHaveClass("nav-link disabled");

    // Enter required name
    const nameField = getByPlaceholderText("Enter name");
    expect(nameField).toBeInTheDocument();
    nameField.focus();
    fireEvent.change(nameField, {target: {value: testName}});
    expect(nameField).toHaveValue(testName);
    nameField.blur();

    // Enter required source collection
    const collInput = document.querySelector((".rbt-input-main"))!;
    fireEvent.change(collInput, {target: {value: testColl}});
    expect(collInput).toHaveValue(testColl);

    // Switch to enabled Advanced tab, check default collections
    fireEvent.click(getByText("Advanced"));

    // Check other defaults
    expect(getByText("Source Database:")).toBeInTheDocument();
    expect(getAllByText(StepsConfig.finalDb)[0]).toBeInTheDocument();
    expect(getByText("Target Database:")).toBeInTheDocument();
    expect(getAllByText(StepsConfig.finalDb)[1]).toBeInTheDocument();
    expect(getByLabelText("advanced-target-collections")).toBeInTheDocument();
    expect(getByText("Target Permissions:")).toBeInTheDocument();
    expect(getByPlaceholderText("Please enter target permissions")).toHaveValue(StepsConfig.defaultTargetPerms);
    expect(getByText("Provenance Granularity:")).toBeInTheDocument();
    expect(getByText("Off")).toBeInTheDocument();
    expect(getByText("Batch Size:")).toBeInTheDocument();
    expect(getByPlaceholderText("Please enter batch size")).toHaveValue(StepsConfig.defaultMergeBatchSize.toString());
    // Open text areas that are closed by default
    fireEvent.click(getByText("Interceptors"));
    expect(getByLabelText("interceptors-textarea")).toBeEmpty();
    fireEvent.click(getByText("Custom Hook"));
    expect(getByLabelText("customHook-textarea")).toBeEmpty();
  });

});

/*
 * Copyright (c) 2021 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.hub;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.List;

/**
 * Handles the calls to the Mastering endpoints.
 */
public interface MasteringManager {

    /**
     * Reverses the last set of merges made into the given merge UR
     * @param mergeURI - URI of the merged document that is being reversed
     * @param retainAuditTrail - determines if provenance for the merge/unmerge is kept
     * @param blockFutureMerges - ensures that the documents won't be merged together in the next mastering run, if true
     * @return - a JsonNode for the unmerge response
     */
    public JsonNode unmerge(String mergeURI, Boolean retainAuditTrail, Boolean blockFutureMerges);

    /**
     * Unmerges the set of uris from a merged document
     * @param mergeURI - URI of the merged document that is being reversed
     * @param retainAuditTrail - determines if provenance for the merge/unmerge is kept
     * @param blockFutureMerges - ensures that the documents won't be merged together in the next mastering run, if true
     * @param removeURIs - URIs of the merged documents that we want to unmerge
     * @return - a JsonNode for the unmerge response
     */
    public JsonNode unmergeRecord(String mergeURI, Boolean retainAuditTrail, Boolean blockFutureMerges, List<String> removeURIs);

    /**
     * Manually merges a set of documents
     * @param mergeURIs - URIs of the documents to merge
     * @param flowName - The name of the flow that has the mastering settings
     * @param stepNumber - The number of the mastering step with settings
     * @param preview - determines if the changes should be written to the database
     * @param options - Overrides any options for the step
     * @return - a JsonNode for the merge response
     */
    public JsonNode merge(List<String> mergeURIs, String flowName, String stepNumber, Boolean preview, JsonNode options);

    /**
     * Manually merges a set of documents
     * @param flowName - The name of the flow that has the merge settings
     * @return - a JsonNode for the merge response
     */
    public JsonNode mergePreview(String flowName, List<String> uris);

    /**
     * Returns potential candidates for merging with a document
     * @param matchURI - URI of the document to find matches for
     * @param flowName - The name of the flow that has the mastering settings
     * @param stepNumber - The number of the mastering step with settings
     * @param includeMatchDetails - determines if the results should also return details of how matches occurred
     * @param options - Overrides any options for the step
     * @return - a JsonNode for the merge response
     */
    public JsonNode match(String matchURI, String flowName, String stepNumber, Boolean includeMatchDetails, JsonNode options);

    /**
     * Returns provenance information about a merged document
     * @param mergedURI - URI of the document that represents a merge
     * @return - a JsonNode with the historical information
     */
    public JsonNode documentHistory(String mergedURI);

    /**
     * Returns notifications
     * @param start - (optional, defaulting to 1) the 1-based index of the first notification to return
     * @param pageLength - (optional, defaulting to 10) the number of notifications to return
     * @return - a JsonNode with the notifications
     */
    public JsonNode notifications(int start, int pageLength);

    /**
     * @param uris - notification document URIs to delete
     * @return - a JsonNode with the notifications delete response
     */
    public JsonNode deleteNotifications(List<String> uris);
}

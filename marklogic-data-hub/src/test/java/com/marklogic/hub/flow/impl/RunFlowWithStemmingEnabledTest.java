package com.marklogic.hub.flow.impl;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.MarkLogicVersion;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.mgmt.api.API;
import com.marklogic.mgmt.api.database.Database;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

public class RunFlowWithStemmingEnabledTest extends AbstractHubCoreTest {

    /*
     https://bugtrack.marklogic.com/54003
     When stemmed search is set to "advanced", fetching legacy mappings and step definitions should not fail since
     we are performing unstemmed searches and the artifacts should be fetched regardless and 'testFlow' should run successfully .
     Reindexing shouldn't have any effect either and 'testFlow' should run fine.
     */
    @Test
    void runFlowWithStemmingSearch() {
        assumeTrue(new MarkLogicVersion(getHubConfig().getManageClient()).getMajor() >= 10);
        try {
            enableAdvancedStemming(true);
            installProjectInFolder("flow-runner-test");

            makeInputFilePathsAbsoluteInFlow("testFlow");
            RunFlowResponse resp = runFlow(new FlowInputs("testFlow"));
            assertEquals(JobStatus.FINISHED.toString(), resp.getJobStatus().toLowerCase());

            reindexDatabase();

            resp = runFlow(new FlowInputs("testFlow"));
            assertEquals(JobStatus.FINISHED.toString(), resp.getJobStatus().toLowerCase());
        }
        finally {
            enableAdvancedStemming(false);
        }
    }

    private void reindexDatabase(){
        DatabaseManager dbManager = new DatabaseManager(runAsAdmin().getManageClient());
        dbManager.reindexDatabase(getHubClient().getDbName(DatabaseKind.STAGING));
        logger.info("Starting to reindex staging database");
        waitForReindex(getHubClient(), HubConfig.DEFAULT_STAGING_NAME);
    }

    private void enableAdvancedStemming(boolean stemming){
        runAsDataHubDeveloper();
        Database db = new Database(new API(getHubClient().getManageClient()), getHubClient().getDbName(DatabaseKind.STAGING));;
        if(stemming){
            db.setStemmedSearches("advanced");
        }
        else {
            db.setStemmedSearches("off");
        }
        db.save();
    }
}

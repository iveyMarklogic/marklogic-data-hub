package com.marklogic.hub.dataservices;

// IMPORTANT: Do not edit. This file is generated.

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.impl.BaseProxy;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.marker.JSONWriteHandle;

import java.io.Reader;

/**
 * Provides a set of operations on the database server
 */
public interface SystemService {
    /**
     * Creates a SystemService object for executing operations on the database server.
     *
     * The DatabaseClientFactory class can create the DatabaseClient parameter. A single
     * client object can be used for any number of requests and in multiple threads.
     *
     * @param db	provides a client for communicating with the database server
     * @return	an object for executing database operations
     */
    static SystemService on(DatabaseClient db) {
      return on(db, null);
    }
    /**
     * Creates a SystemService object for executing operations on the database server.
     *
     * The DatabaseClientFactory class can create the DatabaseClient parameter. A single
     * client object can be used for any number of requests and in multiple threads.
     *
     * The service declaration uses a custom implementation of the same service instead
     * of the default implementation of the service by specifying an endpoint directory
     * in the modules database with the implementation. A service.json file with the
     * declaration can be read with FileHandle or a string serialization of the JSON
     * declaration with StringHandle.
     *
     * @param db	provides a client for communicating with the database server
     * @param serviceDeclaration	substitutes a custom implementation of the service
     * @return	an object for executing database operations
     */
    static SystemService on(DatabaseClient db, JSONWriteHandle serviceDeclaration) {
        final class SystemServiceImpl implements SystemService {
            private DatabaseClient dbClient;
            private BaseProxy baseProxy;

            private BaseProxy.DBFunctionRequest req_getVersions;
            private BaseProxy.DBFunctionRequest req_createCustomRewriters;
            private BaseProxy.DBFunctionRequest req_finishHubDeployment;
            private BaseProxy.DBFunctionRequest req_getDataHubConfig;

            private SystemServiceImpl(DatabaseClient dbClient, JSONWriteHandle servDecl) {
                this.dbClient  = dbClient;
                this.baseProxy = new BaseProxy("/data-hub/5/data-services/system/", servDecl);

                this.req_getVersions = this.baseProxy.request(
                    "getVersions.sjs", BaseProxy.ParameterValuesKind.NONE);
                this.req_createCustomRewriters = this.baseProxy.request(
                    "createCustomRewriters.xqy", BaseProxy.ParameterValuesKind.NONE);
                this.req_finishHubDeployment = this.baseProxy.request(
                    "finishHubDeployment.sjs", BaseProxy.ParameterValuesKind.NONE);
                this.req_getDataHubConfig = this.baseProxy.request(
                    "getDataHubConfig.sjs", BaseProxy.ParameterValuesKind.NONE);
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getVersions() {
                return getVersions(
                    this.req_getVersions.on(this.dbClient)
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getVersions(BaseProxy.DBFunctionRequest request) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request.responseSingle(false, Format.JSON)
                );
            }

            @Override
            public Reader createCustomRewriters() {
                return createCustomRewriters(
                    this.req_createCustomRewriters.on(this.dbClient)
                    );
            }
            private Reader createCustomRewriters(BaseProxy.DBFunctionRequest request) {
              return BaseProxy.XmlDocumentType.toReader(
                request.responseSingle(false, Format.XML)
                );
            }

            @Override
            public void finishHubDeployment() {
                finishHubDeployment(
                    this.req_finishHubDeployment.on(this.dbClient)
                    );
            }
            private void finishHubDeployment(BaseProxy.DBFunctionRequest request) {
              request.responseNone();
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getDataHubConfig() {
                return getDataHubConfig(
                    this.req_getDataHubConfig.on(this.dbClient)
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getDataHubConfig(BaseProxy.DBFunctionRequest request) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request.responseSingle(false, Format.JSON)
                );
            }
        }

        return new SystemServiceImpl(db, serviceDeclaration);
    }

  /**
   * Invokes the getVersions operation on the database server
   *
   * 
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getVersions();

  /**
   * Creates custom rewriter modules for the staging and job app servers
   *
   * 
   * @return	as output
   */
    Reader createCustomRewriters();

  /**
   * Invokes the finishHubDeployment operation on the database server
   *
   * 
   * 
   */
    void finishHubDeployment();

  /**
   * Invokes the getDataHubConfig operation on the database server
   *
   * 
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getDataHubConfig();

}

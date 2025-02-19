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
package com.marklogic.hub.legacy.impl;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices.ServiceResult;
import com.marklogic.client.extensions.ResourceServices.ServiceResultIterator;
import com.marklogic.client.io.DOMHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.legacy.LegacyFlowManager;
import com.marklogic.hub.legacy.collector.impl.LegacyCollectorImpl;
import com.marklogic.hub.legacy.flow.*;
import com.marklogic.hub.legacy.flow.impl.LegacyFlowRunnerImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.regex.Pattern;

@Component
public class LegacyFlowManagerImpl extends LoggingObject implements LegacyFlowManager {

    @Autowired
    private HubConfig hubConfig;

    public LegacyFlowManagerImpl() {
        super();
    }

    /**
     * For use outside of a Spring container.
     *
     * @param hubConfig
     */
    public LegacyFlowManagerImpl(HubConfig hubConfig) {
        this();
        this.hubConfig = hubConfig;
    }

    public void setHubConfig(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }

    @Override
    public List<LegacyFlow> getLocalFlows() {
        List<LegacyFlow> flows = new ArrayList<>();

        Path entitiesDir = hubConfig.getHubProject().getLegacyHubEntitiesDir();
        File[] entities = entitiesDir.toFile().listFiles((pathname -> pathname.isDirectory()));
        if (entities != null) {
            for (File entity : entities) {
                String entityName = entity.getName();
                flows.addAll(getLocalFlowsForEntity(entityName));
            }
        }
        return flows;
    }

    @Override
    public List<LegacyFlow> getLocalFlowsForEntity(String entityName) {
        return getLocalFlowsForEntity(entityName, null);
    }

    @Override
    public List<LegacyFlow> getLocalFlowsForEntity(String entityName, FlowType flowType) {

        List<LegacyFlow> flows = new ArrayList<>();
        Path entitiesDir = hubConfig.getHubProject().getLegacyHubEntitiesDir();
        Path entityDir = entitiesDir.resolve(entityName);
        Path inputDir = entityDir.resolve("input");
        Path harmonizeDir = entityDir.resolve("harmonize");
        boolean getInputFlows = false;
        boolean getHarmonizeFlows = false;
        if (flowType == null) {
            getInputFlows = getHarmonizeFlows = true;
        } else if (flowType.equals(FlowType.INPUT)) {
            getInputFlows = true;
        } else if (flowType.equals(FlowType.HARMONIZE)) {
            getHarmonizeFlows = true;
        }

        if (getInputFlows) {
            File[] inputFlows = inputDir.toFile().listFiles((pathname) -> pathname.isDirectory() && !pathname.getName().equals("REST"));
            if (inputFlows != null) {
                for (File inputFlow : inputFlows) {
                    LegacyFlow flow = getLocalFlow(entityName, inputFlow.toPath(), FlowType.INPUT);
                    if (flow != null) {
                        flows.add(flow);
                    }
                }
            }
        }

        if (getHarmonizeFlows) {
            File[] harmonizeFlows = harmonizeDir.toFile().listFiles((pathname) -> pathname.isDirectory() && !pathname.getName().equals("REST"));
            if (harmonizeFlows != null) {
                for (File harmonizeFlow : harmonizeFlows) {
                    LegacyFlow flow = getLocalFlow(entityName, harmonizeFlow.toPath(), FlowType.HARMONIZE);
                    if (flow != null) {
                        flows.add(flow);
                    }

                }
            }
        }
        return flows;
    }

    @Override
    public LegacyFlow getFlowFromProperties(Path propertiesFile) {
        String quotedSeparator = Pattern.quote(File.separator);
        /* Extract flowName and entityName from ..../plugins/entities/<entityName>/
         * input|harmonize/<flowName>/flowName.properties
         */
        String floweRegex = ".+" + "plugins" + quotedSeparator + "entities" + quotedSeparator + "(.+)" + quotedSeparator
            + "(input|harmonize)" + quotedSeparator + "(.+)" + quotedSeparator + ".+";
        FlowType flowType = propertiesFile.toString().replaceAll(floweRegex, "$2").equals("input")
            ? FlowType.INPUT : FlowType.HARMONIZE;

        String entityName = propertiesFile.toString().replaceAll(floweRegex, "$1");
        Path propertiesDir = propertiesFile.getParent();
        return propertiesDir == null ? null : getLocalFlow(entityName, propertiesDir, flowType);
    }

    private LegacyFlow getLocalFlow(String entityName, Path flowDir, FlowType flowType) {
        Path flowPath = flowDir.getFileName();
        if (flowPath == null) {
            return null;
        }
        String flowName = flowPath.toString();
        File propertiesFile = flowDir.resolve(flowName + ".properties").toFile();
        if (propertiesFile.exists()) {
            Properties properties = new Properties();
            try (FileInputStream fis = new FileInputStream(propertiesFile)) {
                properties.load(fis);
            } catch (FileNotFoundException e) {
                logger.warn("Unable to locate properties file for legacy flow: " + flowName, e);
                return null;
            } catch (IOException e) {
                logger.warn("Unable to load properties file for legacy flow: " + flowName, e);
                return null;
            }

            // trim trailing whitespaces for properties.
            for (Map.Entry<Object, Object> entry : properties.entrySet()) {
                properties.put(entry.getKey(), entry.getValue().toString().trim());
            }

            LegacyFlowBuilder flowBuilder = LegacyFlowBuilder.newFlow()
                .withEntityName(entityName)
                .withName(flowName)
                .withType(flowType)
                .withCodeFormat(CodeFormat.getCodeFormat((String) properties.get("codeFormat")))
                .withDataFormat(DataFormat.getDataFormat((String) properties.get("dataFormat")))
                .withMain(new MainPluginImpl((String) properties.get("mainModule"), CodeFormat.getCodeFormat((String) properties.get("mainCodeFormat"))));

            if (flowType.equals(FlowType.HARMONIZE)) {
                flowBuilder.withCollector(new LegacyCollectorImpl((String) properties.get("collectorModule"), CodeFormat.getCodeFormat((String) properties.get("collectorCodeFormat"))));
            }

            return flowBuilder.build();
        }
        return null;
    }

    @Override
    public List<LegacyFlow> getFlows(String entityName) {
        return new FlowResource(hubConfig.newStagingClient()).getFlows(entityName);
    }

    @Override
    public LegacyFlow getFlow(String entityName, String flowName) {
        return getFlow(entityName, flowName, null);
    }

    @Override
    public LegacyFlow getFlow(String entityName, String flowName, FlowType flowType) {
        return new FlowResource(hubConfig.newStagingClient()).getFlow(entityName, flowName, flowType);
    }

    @Override
    public LegacyFlowRunner newFlowRunner() {
        return new LegacyFlowRunnerImpl(hubConfig);
    }

}

class FlowResource extends ResourceManager {

    public FlowResource(DatabaseClient client) {
        client.init("mlFlow", this);
    }

    public List<LegacyFlow> getFlows(String entityName) {
        RequestParameters params = new RequestParameters();
        params.add("entity-name", entityName);
        ServiceResultIterator resultItr = this.getServices().get(params);
        if (resultItr == null || !resultItr.hasNext()) {
            return null;
        }
        ServiceResult res = resultItr.next();
        DOMHandle handle = new DOMHandle();
        Document parent = res.getContent(handle).get();
        NodeList children = parent.getDocumentElement().getChildNodes();

        if (children.getLength() <= 0) {
            return null;
        }

        ArrayList<LegacyFlow> flows = new ArrayList<>();
        Node node;
        for (int i = 0; i < children.getLength(); i++) {
            node = children.item(i);
            if (node.getNodeType() == Node.ELEMENT_NODE) {
                flows.add(LegacyFlowManager.flowFromXml((Element) children.item(i)));
            }
        }
        return flows;
    }

    public LegacyFlow getFlow(String entityName, String flowName, FlowType flowType) {
        RequestParameters params = new RequestParameters();
        params.add("entity-name", entityName);
        params.add("flow-name", flowName);
        if (flowType != null) {
            params.add("flow-type", flowType.toString());
        }
        ServiceResultIterator resultItr = this.getServices().get(params);
        if (resultItr == null || !resultItr.hasNext()) {
            return null;
        }
        ServiceResult res = resultItr.next();
        DOMHandle handle = new DOMHandle();
        Document parent = res.getContent(handle).get();
        return LegacyFlowManager.flowFromXml(parent.getDocumentElement());
    }
}

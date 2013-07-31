
package de.hpi.bpmn2bpel.factories.apacheode.deploymentservice.stub;

import javax.jws.WebMethod;
import javax.jws.WebParam;
import javax.jws.WebResult;
import javax.jws.WebService;
import javax.xml.bind.annotation.XmlSeeAlso;
import javax.xml.namespace.QName;
import javax.xml.ws.RequestWrapper;
import javax.xml.ws.ResponseWrapper;


/**
 * This class was generated by the JAX-WS RI.
 * JAX-WS RI 2.1.3.1-hudson-417-SNAPSHOT
 * Generated source version: 2.1
 * 
 */
@WebService(name = "DeploymentServicePortType", targetNamespace = "http://www.apache.org/ode/deployapi")
@XmlSeeAlso({
    ObjectFactory.class
})
public interface DeploymentServicePortType {


    /**
     * 
     * @param processName
     * @return
     *     returns java.lang.String
     */
    @WebMethod
    @WebResult(name = "packageName", targetNamespace = "")
    @RequestWrapper(localName = "getProcessPackage", targetNamespace = "http://www.apache.org/ode/pmapi", className = "de.hpi.bpmn2bpel.factories.apacheode.deploymentservice.stub.GetProcessPackage")
    @ResponseWrapper(localName = "getProcessPackageResponse", targetNamespace = "http://www.apache.org/ode/pmapi", className = "de.hpi.bpmn2bpel.factories.apacheode.deploymentservice.stub.GetProcessPackageResponse")
    public String getProcessPackage(
        @WebParam(name = "processName", targetNamespace = "")
        QName processName);

    /**
     * 
     * @param packageName
     * @return
     *     returns boolean
     */
    @WebMethod
    @WebResult(name = "response", targetNamespace = "")
    @RequestWrapper(localName = "undeploy", targetNamespace = "http://www.apache.org/ode/pmapi", className = "de.hpi.bpmn2bpel.factories.apacheode.deploymentservice.stub.Undeploy")
    @ResponseWrapper(localName = "undeployResponse", targetNamespace = "http://www.apache.org/ode/pmapi", className = "de.hpi.bpmn2bpel.factories.apacheode.deploymentservice.stub.UndeployResponse")
    public boolean undeploy(
        @WebParam(name = "packageName", targetNamespace = "")
        QName packageName);

    /**
     * 
     * @param _package
     * @param name
     * @return
     *     returns de.hpi.bpmn2bpel.factories.apacheode.deploymentservice.stub.DeployUnit
     */
    @WebMethod
    @WebResult(name = "response", targetNamespace = "")
    @RequestWrapper(localName = "deploy", targetNamespace = "http://www.apache.org/ode/pmapi", className = "de.hpi.bpmn2bpel.factories.apacheode.deploymentservice.stub.Deploy")
    @ResponseWrapper(localName = "deployResponse", targetNamespace = "http://www.apache.org/ode/pmapi", className = "de.hpi.bpmn2bpel.factories.apacheode.deploymentservice.stub.DeployResponse")
    public DeployUnit deploy(
        @WebParam(name = "name", targetNamespace = "")
        String name,
        @WebParam(name = "package", targetNamespace = "")
        Package _package);

    /**
     * 
     * @param packageName
     * @return
     *     returns de.hpi.bpmn2bpel.factories.apacheode.deploymentservice.stub.ProcessIds
     */
    @WebMethod
    @WebResult(name = "processIds", targetNamespace = "")
    @RequestWrapper(localName = "listProcesses", targetNamespace = "http://www.apache.org/ode/pmapi", className = "de.hpi.bpmn2bpel.factories.apacheode.deploymentservice.stub.ListProcesses")
    @ResponseWrapper(localName = "listProcessesResponse", targetNamespace = "http://www.apache.org/ode/pmapi", className = "de.hpi.bpmn2bpel.factories.apacheode.deploymentservice.stub.ListProcessesResponse")
    public ProcessIds listProcesses(
        @WebParam(name = "packageName", targetNamespace = "")
        String packageName);

    /**
     * 
     * @return
     *     returns de.hpi.bpmn2bpel.factories.apacheode.deploymentservice.stub.PackageNames
     */
    @WebMethod
    @WebResult(name = "deployedPackages", targetNamespace = "")
    @RequestWrapper(localName = "listDeployedPackages", targetNamespace = "http://www.apache.org/ode/pmapi", className = "de.hpi.bpmn2bpel.factories.apacheode.deploymentservice.stub.ListDeployedPackages")
    @ResponseWrapper(localName = "listDeployedPackagesResponse", targetNamespace = "http://www.apache.org/ode/pmapi", className = "de.hpi.bpmn2bpel.factories.apacheode.deploymentservice.stub.ListDeployedPackagesResponse")
    public PackageNames listDeployedPackages();

}

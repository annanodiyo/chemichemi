//#region \0%23tanstack-start-server-fn-resolver
var manifest = { "de338a082dba473e3ef7cc34641b099226871a2ac42936547af81583676d1d68": {
	functionName: "sendSandboxRiskAlert_createServerFn_handler",
	importer: () => import("./sms-YeiIhPsX.js")
} };
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
